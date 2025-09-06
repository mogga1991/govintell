import { notFound } from "next/navigation"
import { Metadata } from "next"

interface PageProps {
  params: {
    slug: string[]
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: "Page Not Found",
    description: "The requested page could not be found.",
  }
}

export async function generateStaticParams(): Promise<PageProps["params"][]> {
  return []
}

export default async function PagePage({ params }: PageProps) {
  // For now, just return not found since contentlayer is not set up
  notFound()
}
