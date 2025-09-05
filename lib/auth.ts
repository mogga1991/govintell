import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import GitHubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { Client } from "postmark"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import { db } from "@/lib/db"

const postmarkClient = new Client(env.POSTMARK_API_TOKEN)

export const authOptions: NextAuthOptions = {
  // huh any! I know.
  // This is a temporary fix for prisma client.
  // @see https://github.com/prisma/prisma/issues/16117
  adapter: PrismaAdapter(db as any),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          company_name: user.company_name ?? undefined,
          naics_codes: user.naics_codes ?? undefined,
          psc_codes: user.psc_codes ?? undefined,
          profile_completed: user.profile_completed,
          business_verified: user.business_verified,
        }
      },
    }),
    // EmailProvider temporarily disabled - configure Postmark credentials to enable
    // EmailProvider({
    //   from: env.SMTP_FROM,
    //   sendVerificationRequest: async ({ identifier, url, provider }) => {
    //     const user = await db.user.findUnique({
    //       where: {
    //         email: identifier,
    //       },
    //       select: {
    //         emailVerified: true,
    //       },
    //     })

    //     const templateId = user?.emailVerified
    //       ? env.POSTMARK_SIGN_IN_TEMPLATE
    //       : env.POSTMARK_ACTIVATION_TEMPLATE
    //     if (!templateId) {
    //       throw new Error("Missing template id")
    //     }

    //     const result = await postmarkClient.sendEmailWithTemplate({
    //       TemplateId: parseInt(templateId),
    //       To: identifier,
    //       From: provider.from as string,
    //       TemplateModel: {
    //         action_url: url,
    //         product_name: siteConfig.name,
    //       },
    //       Headers: [
    //         {
    //           // Set this to prevent Gmail from threading emails.
    //           // See https://stackoverflow.com/questions/23434110/force-emails-not-to-be-grouped-into-conversations/25435722.
    //           Name: "X-Entity-Ref-ID",
    //           Value: new Date().getTime() + "",
    //         },
    //       ],
    //     })

    //     if (result.ErrorCode) {
    //       throw new Error(result.Message)
    //     }
    //   },
    // }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
        session.user.company_name = (token.company_name ?? null) as string | null
        session.user.naics_codes = (token.naics_codes ?? null) as string | null
        session.user.psc_codes = (token.psc_codes ?? null) as string | null
        session.user.profile_completed = Boolean(token.profile_completed)
        session.user.business_verified = Boolean(token.business_verified)
      }

      return session
    },
    async jwt({ token, user }) {
      // When a user signs in, copy fields onto the token (which is a JWT)
      if (user) {
        token.id = user.id
        token.company_name = user.company_name ?? null
        token.naics_codes = user.naics_codes ?? null
        token.psc_codes = user.psc_codes ?? null
        token.profile_completed = user.profile_completed
        token.business_verified = user.business_verified
        // token.name / token.email / token.picture are standard and already handled
      } else {
        // For existing sessions, refresh user data from database
        const dbUser = await db.user.findFirst({
          where: {
            email: token.email,
          },
        })

        if (dbUser) {
          // Update token with latest user data
          token.id = dbUser.id
          token.name = dbUser.name
          token.email = dbUser.email
          token.picture = dbUser.image
          token.company_name = dbUser.company_name ?? null
          token.naics_codes = dbUser.naics_codes ?? null
          token.psc_codes = dbUser.psc_codes ?? null
          token.profile_completed = dbUser.profile_completed
          token.business_verified = dbUser.business_verified
        }
      }

      return token
    },
  },
}
