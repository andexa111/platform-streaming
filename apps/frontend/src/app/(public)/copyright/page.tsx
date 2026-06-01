export default function CopyrightPage() {
  return (
    <div className="container mx-auto py-24 px-6 max-w-4xl min-h-screen">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-4">Copyright Policy</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Information about our copyright policies and how we protect intellectual property.
        </p>
      </div>

      <div className="bg-card/40 dark:bg-neutral-900/40 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] border border-border shadow-2xl">
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg mb-6">
            Sinea respects the intellectual property rights of others and expects its users to do the same. 
            It is our policy, in appropriate circumstances and at our discretion, to disable and/or terminate the accounts 
            of users who repeatedly infringe the copyrights or other intellectual property rights of others.
          </p>
          
          <h2 className="text-xl font-bold mt-8 mb-4">1. Notification of Copyright Infringement</h2>
          <p className="text-muted-foreground mb-4">
            If you are a copyright owner, or are authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by completing the following DMCA Notice of Alleged Infringement and delivering it to Sinea's Designated Copyright Agent.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">2. Counter-Notice</h2>
          <p className="text-muted-foreground mb-4">
            If you believe that your content that was removed (or to which access was disabled) is not infringing, or that you have the authorization from the copyright owner, the copyright owner's agent, or pursuant to the law, to post and use the material in your content, you may send a counter-notice containing the necessary information to the Copyright Agent.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">3. Repeat Infringer Policy</h2>
          <p className="text-muted-foreground mb-4">
            In accordance with the DMCA and other applicable law, Sinea has adopted a policy of terminating, in appropriate circumstances and at Sinea's sole discretion, users who are deemed to be repeat infringers. Sinea may also at its sole discretion limit access to the Site and/or terminate the accounts of any users who infringe any intellectual property rights of others, whether or not there is any repeat infringement.
          </p>

          <div className="mt-12 p-6 bg-muted/50 rounded-2xl border border-border">
            <h3 className="font-bold mb-2">Contact our Copyright Agent:</h3>
            <p className="text-sm text-muted-foreground">
              Email: copyright@sinea.com<br/>
              Address: Sinea Legal Department, Jakarta, Indonesia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
