import LegalPage from '@/components/LegalPage';

export const metadata = {
  title: 'Terms of Service · Foster A Wag',
  description: 'The terms you agree to when using Foster A Wag.',
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="30 August 2026"
      intro="These terms apply to everyone who uses Foster A Wag — foster families, rescue organizations, and visitors. By creating an account you agree to them."
    >
      <h2>1. What Foster A Wag is</h2>
      <p>
        Foster A Wag is an introduction service. We provide a place for rescue organizations to
        list animals who need temporary homes, and for foster families to find those listings and
        apply.
      </p>
      <p>
        <strong>We are not a rescue, a shelter, or a party to any fostering arrangement.</strong> We
        do not own, house, examine, transport, assess, or place animals. When a rescue and a foster
        agree to a placement, that agreement is between the two of them. We are not a signatory to
        it and we do not enforce it.
      </p>

      <h2>2. Accounts and approval</h2>
      <p>
        Registering does not create an active account. Every foster and rescue application is
        reviewed by us before the account can sign in. We may ask for additional information — from
        rescue organizations, that normally includes evidence that the organization is what it says
        it is.
      </p>
      <p>
        We may decline an application, or suspend or remove an account, at our discretion. We will
        usually explain why, but we are not obliged to. Reasons include giving false information,
        misusing another person&rsquo;s data, or behaviour that puts an animal or a person at risk.
      </p>
      <p>
        You are responsible for keeping your password to yourself and for everything done through
        your account.
      </p>

      <h2>3. Information you agree to provide</h2>
      <p>
        Fostering requires both sides to share real details about themselves. By creating an account
        you agree to provide accurate information about yourself, your household or your
        organization, and to keep it up to date. Specifically, you agree that:
      </p>
      <ul>
        <li>
          the personal information you give us — including your contact details, where you live, who
          lives in your home, and the references you supply — is true to the best of your knowledge;
        </li>
        <li>
          we may store that information and show relevant parts of it to the other side of a
          potential match, as described in our <a href="/privacy">Privacy Policy</a>;
        </li>
        <li>
          where you provide someone else&rsquo;s details — a veterinarian or a personal reference —
          you have their permission to do so;
        </li>
        <li>
          you will not submit information about anyone under 18 as an account holder.
        </li>
      </ul>
      <p>
        Giving false information is grounds for removing your account. It may also put an animal in
        an unsuitable home, which is the outcome this whole platform exists to avoid.
      </p>

      <h2>4. If you are a rescue organization</h2>
      <ul>
        <li>Describe each animal honestly, including known medical needs and behavioural history.</li>
        <li>
          Do not conceal a bite history, an ongoing medical condition, or anything else a foster
          would reasonably want to know before taking an animal into their home.
        </li>
        <li>
          Where a compatibility question has not been tested, mark it &ldquo;don&rsquo;t know&rdquo;
          rather than guessing.
        </li>
        <li>You remain responsible for vetting and selecting your own fosters.</li>
      </ul>

      <h2>5. If you are a foster</h2>
      <ul>
        <li>Provide accurate information about your home, household, and availability.</li>
        <li>
          Satisfy yourself about an animal and the rescue before agreeing to a placement. Ask
          questions. Ask for a written fostering agreement.
        </li>
        <li>Care for any animal placed with you, and follow whatever you agree with the rescue.</li>
      </ul>

      <h2>6. We are not responsible for damages caused by an animal</h2>
      <p>
        This matters, so it is stated plainly. Animals are living creatures and their behaviour is
        not fully predictable, including by the people who know them best.
      </p>
      <p>
        <strong>
          Foster A Wag is not liable for any injury, illness, loss, or damage arising from an animal
          listed on or arranged through this site.
        </strong>{' '}
        That includes, without limitation:
      </p>
      <ul>
        <li>bites, scratches, or any other injury to you, your household, your visitors, or others;</li>
        <li>injury to or death of another animal;</li>
        <li>damage to your home, belongings, vehicle, or property;</li>
        <li>veterinary costs, boarding costs, or the cost of professional training or behavioural help;</li>
        <li>illness transmitted by an animal;</li>
        <li>
          anything arising because an animal was described inaccurately or incompletely by the
          rescue that listed it.
        </li>
      </ul>
      <p>
        We do not assess animals and we cannot verify what a rescue tells us about one. Responsibility
        for an animal, and for what it does, rests with the rescue that placed it and the foster who
        accepted it, according to whatever they agreed between themselves.
      </p>
      <p>
        We strongly recommend that fosters and rescues put their arrangement in writing before an
        animal changes hands, that it says who pays for veterinary care and property damage, and
        that fosters check whether their home insurance covers an animal they do not own.
      </p>

      <h2>7. No guarantees about matches</h2>
      <p>
        We do not guarantee that a foster will find an animal, that a rescue will find a foster, that
        any listing is accurate, or that any organization or person using this site is suitable. We
        review accounts before activating them, but that review is not a background check,
        an inspection, or an endorsement.
      </p>

      <h2>8. What you post</h2>
      <p>
        You keep ownership of the text and photographs you upload. You give us permission to display
        them on the site for the purpose of running it. Do not upload anything you do not have the
        right to use, and do not upload anything unlawful, misleading, or abusive. We may remove
        content that breaches these terms.
      </p>

      <h2>9. Limits of our liability</h2>
      <p>
        The site is provided as it is. We do not promise it will be available without interruption or
        free of errors. To the fullest extent the law allows, we are not liable for indirect or
        consequential losses arising from your use of the site.
      </p>
      <p>
        Nothing in these terms excludes liability that cannot lawfully be excluded.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update these terms. When we make a significant change we will update the date at the
        top of this page. Continuing to use the site after a change means you accept the revised
        terms.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the laws of the Province of Ontario and the federal laws of
        Canada that apply there.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these terms can go to{' '}
        <a href="mailto:fosterawag@gmail.com">fosterawag@gmail.com</a>, or through our{' '}
        <a href="/contact">Contact Us</a> page.
      </p>
    </LegalPage>
  );
}
