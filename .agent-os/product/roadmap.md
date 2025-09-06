# Product Roadmap

## Phase 1: MVP - Core RFQ Ingestion & Analysis

**Goal:** Establish the core workflow, allowing a user to process a government RFQ from multiple sources, have it analyzed by AI, and generate a quote based on sourced products.
**Success Criteria:** A user can successfully process an RFQ using any of the three input methods and receive a downloadable CSV quote.

### Features
- [ ] **Setup SAM.gov API Integration:** Securely store and utilize the SAM.gov API key to enable direct data fetching. `[Effort: S]`
- [ ] **Feature: Upload RFQ Document:** Create a file upload interface for users to submit RFQ documents (.pdf, .docx) directly for processing. `[Effort: M]`
- [ ] **Feature: Paste URL for Scraping:** Create a text input field where a user can paste a URL from SAM.gov or DIBBS. The backend will scrape and parse the relevant RFQ data. `[Effort: M]`
- [ ] **Feature: In-App RFQ Search:** Build a simple search interface (search bar, filters for NIACS/PSC codes) that queries the SAM.gov API and displays a list of active RFQs. `[Effort: L]`
- [ ] **Core AI Analysis:** Once an RFQ is ingested (from any source), send the document/data to the AI backend to extract key requirements (product specs, quantities, compliance, packaging). `[Effort: L]`
- [ ] **Automated Product Sourcing:** Use the extracted requirements to automatically search for matching products from a predefined list of vendor/supplier APIs. `[Effort: L]`
- [ ] **Quote Generation:** Display the sourced products with their prices, allow the user to input a desired profit margin, and generate a final quote as a downloadable CSV file. `[Effort: M]`

---

## Phase 2: Workflow & Usability Enhancements

**Goal:** Streamline the post-quote process and improve the user's ability to manage their work within the app.
**Success Criteria:** Users can track the status of their quotes and automate initial communications.

### Features
- [ ] **n8n Workflow Integration:** Create webhooks to trigger n8n workflows for emailing the generated quote to a POC or sending inquiries to suppliers. `[Effort: M]`
- [ ] **RFQ Dashboard:** Create a main dashboard where users can see and manage the status of all ingested RFQs (e.g., New, Analyzing, Sourced, Quoted). `[Effort: L]`
- [ ] **Saved Searches & Alerts:** Allow users to save common search criteria and receive notifications for new, matching RFQs. `[Effort: M]`