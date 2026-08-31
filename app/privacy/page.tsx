import LegalPage from '@/components/LegalPage';

export const metadata = {
  title: 'Privacy Policy · Foster A Wag',
  description: 'What Foster A Wag collects, why, who can see it, and what we will never do with it.',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="30 August 2026"
      intro="Fostering only works if both sides share real details about themselves. This page sets out exactly what we collect, who can see it, and what we will never do with it."
    >
      <h2>1. Who we are</h2>
      <p>
        Foster A Wag is a small, family-run platform based in Ontario, Canada. We can be reached at{' '}
        <a href="mailto:fosterawag@gmail.com">fosterawag@gmail.com</a>.
      </p>

      <h2>2. What we collect</h2>
      <p>
        We collect what is needed to introduce a foster family to a rescue organization, and nothing
        we cannot justify by that purpose.
      </p>

      <h3>Everyone with an account</h3>
      <ul>
        <li>Email address</li>
        <li>
          A password, stored only as a one-way cryptographic hash. We never store your password
          itself and cannot see it or recover it.
        </li>
        <li>Whether the account is a foster or a rescue, and where it sits in our approval process</li>
      </ul>

      <h3>Foster families</h3>
      <ul>
        <li>Name, phone number, and email address</li>
        <li>City, province, and postal code — we do not ask for your street address</li>
        <li>
          Details about your home and household: type of dwelling, whether you have a fenced yard,
          the number of adults and <strong>the number of children</strong> living there, and other
          animals already in the home
        </li>
        <li>When you are available to foster, and what kinds of animals you can take</li>
        <li>A profile photograph, if you choose to add one</li>
      </ul>

      <h3>Rescue organizations</h3>
      <ul>
        <li>Organization name, contact email, phone number, and website</li>
        <li>City, province, and address</li>
        <li>A logo, if you choose to add one</li>
        <li>The listings you create, including photographs of the animals</li>
      </ul>

      <h3>When you apply to foster an animal</h3>
      <ul>
        <li>Why you want to foster that animal, and a description of your daily schedule</li>
        <li>
          <strong>The name and phone number of your veterinarian and of a personal reference</strong>
        </li>
        <li>Your typed signature and your acceptance of the fostering terms</li>
        <li>Any message you send with an expression of interest</li>
      </ul>

      <h3>What we do not collect</h3>
      <p>
        We do not collect payment or banking details, government identification, health records, or
        your street address. We do not use advertising trackers or third-party analytics, and we do
        not build a profile of you across other websites.
      </p>

      <h2>3. Why we collect it</h2>
      <ul>
        <li>To create and operate your account</li>
        <li>To review an application before activating an account, which is a manual step done by a person</li>
        <li>To show rescues the information they need in order to consider you as a foster, and to show fosters the animals available to them</li>
        <li>To let the two sides contact each other once there is genuine interest</li>
        <li>To keep the platform safe and deal with misuse</li>
      </ul>
      <p>
        By creating an account you consent to us collecting and using your information for these
        purposes. You can withdraw that consent by asking us to close your account, subject to
        section 8.
      </p>

      <h2>4. Who can see your information</h2>
      <p>This is the part worth reading closely.</p>

      <h3>Publicly visible to anyone, including people without an account</h3>
      <ul>
        <li>
          Active animal listings: the animal&rsquo;s details and photographs, the city it is in, and
          the name of the rescue organization that posted it
        </li>
        <li>
          A rescue organization&rsquo;s public contact details on its listings — organization name,
          city, contact email, and website
        </li>
      </ul>
      <p>
        <strong>Foster profiles are never public.</strong> No part of a foster profile is visible to
        someone without an approved account.
      </p>

      <h3>Visible to approved rescue organizations</h3>
      <p>
        Once your foster profile is complete, any approved rescue organization on the platform can
        browse it. <strong>That includes your name, email address, phone number, city, province,
        postal code, household composition including the number of children, your other animals,
        and your availability</strong> — not only rescues you have applied to.
      </p>
      <p>
        If you would prefer a rescue not to see those details, leave your profile incomplete until
        you are ready. An incomplete profile is excluded from the browse list, though it also
        prevents you from applying to foster.
      </p>

      <h3>Visible to a specific rescue organization</h3>
      <p>
        When you apply to foster a particular animal, the rescue that posted it also sees your full
        application: your reasons, your schedule, and your veterinary and personal references.
      </p>

      <h3>Visible to us</h3>
      <p>
        We can see all of the above in order to review accounts and deal with problems. We keep this
        to what the task requires.
      </p>

      <h2>5. What we will not do</h2>
      <p>We want to be unambiguous about this.</p>
      <ul>
        <li><strong>We will not sell your information.</strong> Not to anyone, for any amount.</li>
        <li><strong>We will not rent, trade, or share it with advertisers or data brokers.</strong></li>
        <li>
          <strong>We will not use it for anything unrelated to matching fosters with rescues.</strong>{' '}
          We will not market other products to you or add you to mailing lists you did not ask for.
        </li>
        <li>
          <strong>We will not give a rescue organization your information for any purpose other
          than considering a foster placement.</strong> Rescues agree to this in our{' '}
          <a href="/terms">Terms of Service</a>.
        </li>
        <li>
          We will not disclose your information to anyone else unless you ask us to, or we are
          legally required to, or it is genuinely necessary to prevent harm to a person or an animal.
        </li>
      </ul>

      <h2>6. Where it is kept, and how it is protected</h2>
      <p>
        Your information is stored in Google Cloud data centres in Canada. Photographs are stored in
        Google Cloud Storage. Access is limited to the accounts that need it to run the service.
      </p>
      <p>
        Traffic to the site is encrypted in transit. Passwords are hashed, never stored as text.
        Sign-in sessions use an encrypted cookie.
      </p>
      <p>
        Please note that photographs uploaded to listings are served from addresses that are not
        guessable but are not individually access-controlled. Do not upload a photograph containing
        anything you would not want seen by someone holding its link.
      </p>
      <p>
        No system is perfectly secure. We take reasonable measures, and we will tell affected users
        promptly if we become aware of a breach involving their personal information.
      </p>

      <h2>7. References you provide about other people</h2>
      <p>
        When you give us your veterinarian&rsquo;s or a personal reference&rsquo;s name and phone
        number, you are giving us information about someone who has not signed up here. Please ask
        them first. We store those details only so the rescue considering your application can
        follow them up, and we delete them with the rest of your application.
      </p>

      <h2>8. How long we keep it</h2>
      <ul>
        <li>Account and profile information: while your account is open.</li>
        <li>
          Applications and messages: while your account is open, since both sides may need to refer
          back to them.
        </li>
        <li>
          After you ask us to close your account, we delete your profile, applications, and messages.
          A record that the account existed may remain in backups for a short period before those
          backups age out.
        </li>
        <li>
          Declined account applications are deleted once we no longer need them to explain the
          decision.
        </li>
      </ul>

      <h2>9. Your rights</h2>
      <p>
        Under Canadian privacy law, including PIPEDA, you can ask us to:
      </p>
      <ul>
        <li>tell you what personal information we hold about you;</li>
        <li>give you a copy of it;</li>
        <li>correct it if it is wrong;</li>
        <li>delete it and close your account.</li>
      </ul>
      <p>
        Email <a href="mailto:fosterawag@gmail.com">fosterawag@gmail.com</a> and we will respond
        within 30 days. You may also edit most of your own information from your dashboard at any
        time.
      </p>

      <h2>10. Children</h2>
      <p>
        Accounts are for adults. We do not knowingly create accounts for anyone under 18. Foster
        profiles record the <em>number</em> of children in a household, because it is relevant to
        placing an animal, but we do not collect their names, ages, or any other detail about them.
      </p>

      <h2>11. Changes</h2>
      <p>
        If we change this policy we will update the date at the top. If a change materially affects
        how we use information you have already given us, we will contact account holders directly
        rather than relying on you to re-read this page.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions, requests, or concerns about your privacy go to{' '}
        <a href="mailto:fosterawag@gmail.com">fosterawag@gmail.com</a>. If you are not satisfied with
        our response, you can contact the Office of the Privacy Commissioner of Canada.
      </p>
    </LegalPage>
  );
}
