# GovIntelligence

A modern government contracting intelligence and RFQ management platform built with Next.js 15 and React 19.

## 🚀 Features

### RFQ Management
- **Browse Opportunities**: View and search government RFQ opportunities
- **Save & Organize**: Bookmark interesting opportunities for later review
- **Detailed Analysis**: Access comprehensive RFQ information including requirements, deadlines, and contract values
- **Product Research**: Research relevant products and solutions for each opportunity

### User Interface
- **Clean Design**: Simple, intuitive interface focused on usability
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Modern Components**: Built with shadcn/ui components and Tailwind CSS
- **Real-time Updates**: Live data updates and status indicators

### Documentation & Support
- **Comprehensive Docs**: Built-in documentation with step-by-step guides
- **Support Center**: FAQ and contact information for user assistance
- **User Onboarding**: Progressive profile completion and guided setup

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Runtime**: React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Prisma ORM
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Development**: TypeScript, ESLint, Prettier

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Database (PostgreSQL recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taxonomy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your database URL and other required environment variables.

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── (marketing)/       # Marketing pages
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility libraries and configurations
├── types/                # TypeScript type definitions
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 🎨 Key Components

### RfqCard
Simple, clean cards displaying RFQ information with save/unsave functionality.

### Documentation Pages
- `/docs` - Platform usage guides and tutorials
- `/support` - FAQ and support information

### Research Features
- Product research tools
- Requirements analysis
- Matching algorithms

## 🔧 Configuration

### Dashboard Navigation
The platform includes configurable navigation in `config/dashboard.ts`:
- Documentation access
- Support center
- User settings
- Billing management

### Icons
Custom icon set based on Lucide React with platform-specific additions for government contracting (medical, technology, security, etc.).

## 📊 Features in Detail

### RFQ Opportunities
- Government contract listings
- Advanced search and filtering
- Categorization by NAICS/PSC codes
- Contract value estimation
- Deadline tracking

### User Management
- Profile completion tracking
- Company information management
- Preference settings
- Activity history

### Research Tools
- Product matching algorithms
- Requirements extraction
- Competitive analysis
- Quote generation

## 🐛 Bug Fixes

This version includes fixes for:
- React 19 compatibility issues
- HTML structure validation errors
- Icon loading problems
- Duplicate key warnings
- Form submission handling

## 🚀 Deployment

The application is ready for deployment on platforms like:
- Vercel (recommended for Next.js)
- Netlify
- Railway
- Self-hosted solutions

Make sure to set up your environment variables and database in your deployment environment.

## 📄 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📞 Support

For support and questions:
- Check the built-in documentation at `/docs`
- Visit the support center at `/support`
- Contact: support@govintelligence.com

---

Built with ❤️ for government contractors and procurement professionals.