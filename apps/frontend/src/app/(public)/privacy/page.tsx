export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-24 px-6 max-w-4xl min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          How we collect, use, and protect your personal information.
        </p>
      </div>

      <div className="bg-card/40 dark:bg-neutral-900/40 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] border border-border shadow-2xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            At Sinea, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-muted-foreground mb-4">
            We may collect personal identification information from Users in a variety of ways, including, but not limited to, when Users visit our site, register on the site, subscribe to the newsletter, fill out a form, and in connection with other activities, services, features or resources we make available on our Site. Users may be asked for, as appropriate, name, email address, mailing address, phone number, and credit card information.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">2. How We Use Collected Information</h2>
          <p className="text-muted-foreground mb-4">
            Sinea may collect and use Users personal information for the following purposes:
          </p>
          <ul className="list-disc pl-5 text-muted-foreground mb-4 space-y-2">
            <li>To improve customer service: Information you provide helps us respond to your customer service requests and support needs more efficiently.</li>
            <li>To personalize user experience: We may use information in the aggregate to understand how our Users as a group use the services and resources provided on our Site.</li>
            <li>To process payments: We may use the information Users provide about themselves when placing an order only to provide service to that order. We do not share this information with outside parties except to the extent necessary to provide the service.</li>
            <li>To send periodic emails: We may use the email address to send User information and updates pertaining to their order.</li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-4">3. How We Protect Your Information</h2>
          <p className="text-muted-foreground mb-4">
            We adopt appropriate data collection, storage and processing practices and security measures to protect against unauthorized access, alteration, disclosure or destruction of your personal information, username, password, transaction information and data stored on our Site.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">4. Sharing Your Personal Information</h2>
          <p className="text-muted-foreground mb-4">
            We do not sell, trade, or rent Users personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information regarding visitors and users with our business partners, trusted affiliates and advertisers for the purposes outlined above.
          </p>

          
        </div>
      </div>
    </div>
  );
}
