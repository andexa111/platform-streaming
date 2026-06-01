export default function TermsPage() {
  return (
    <div className="container mx-auto py-24 px-6 max-w-4xl min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-4">Terms of Service</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Please read these terms carefully before using our platform.
        </p>
      </div>

      <div className="bg-card/40 dark:bg-neutral-900/40 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] border border-border shadow-2xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            Welcome to Sinea! By accessing or using our website, services, or applications, you agree to be bound by these Terms of Service.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-4">
            By registering for and/or using the Services in any manner, including but not limited to visiting or browsing the Site, you agree to these Terms of Service and all other operating rules, policies, and procedures that may be published from time to time on the Site by us, each of which is incorporated by reference and each of which may be updated from time to time without notice to you.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">2. Description of Service</h2>
          <p className="text-muted-foreground mb-4">
            Sinea provides a streaming platform for movies and series. We reserve the right to modify, suspend, or discontinue the Service at any time, with or without notice. You agree that Sinea will not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">3. User Conduct</h2>
          <p className="text-muted-foreground mb-4">
            You agree not to use the Service to: (a) upload, post, email, or otherwise transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable; (b) impersonate any person or entity; or (c) upload, post, email, or otherwise transmit any content that you do not have a right to transmit under any law or under contractual or fiduciary relationships.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">4. Subscriptions and Billing</h2>
          <p className="text-muted-foreground mb-4">
            Certain aspects of the Service may be provided for a fee or other charge. If you elect to use paid aspects of the Service, you agree to the pricing and payment terms, as we may update them from time to time.
          </p>

        </div>
      </div>
    </div>
  );
}
