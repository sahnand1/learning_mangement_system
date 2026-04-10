import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <nav className="legal-nav">
        <div className="legal-nav-inner">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-icon">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="landing-logo-text">
              Learn<span className="text-green-400">Hub</span>
            </span>
          </Link>
          <Link to="/" className="legal-back-link">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="legal-container">
        <div className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: April 10, 2026</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to LearnHub ("we," "our," or "us"). We are committed to protecting your personal information
              and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you use our learning management system platform, including our website and
              related services (collectively, the "Platform").
            </p>
            <p>
              By accessing or using the Platform, you agree to the terms of this Privacy Policy. If you do not agree
              with the terms of this policy, please do not access the Platform.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>We collect information that you voluntarily provide when you:</p>
            <ul>
              <li>Register for an account (full name, email address, username, password)</li>
              <li>Create a teacher profile (qualification, experience, specialization, bio)</li>
              <li>Enroll in courses or interact with course content</li>
              <li>Submit quizzes and assessments</li>
              <li>Contact us for support</li>
            </ul>

            <h3>2.2 Usage Data</h3>
            <p>We automatically collect certain information when you access the Platform, including:</p>
            <ul>
              <li>Course progress and lesson completion data</li>
              <li>Quiz scores, attempt history, and performance metrics</li>
              <li>Activity logs (enrollment dates, login timestamps, actions taken)</li>
              <li>Browser type, device information, and IP address</li>
              <li>Pages visited and time spent on the Platform</li>
            </ul>

            <h3>2.3 Cookies & Local Storage</h3>
            <p>
              We use browser local storage to maintain your authentication session (auth token). We do not use
              third-party tracking cookies. Essential session data is stored locally on your device and is removed
              upon logout.
            </p>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and manage your user account</li>
              <li>Provide, maintain, and improve the Platform</li>
              <li>Track your learning progress and generate performance reports</li>
              <li>Enable teachers to provide feedback and schedule exams</li>
              <li>Process account approvals and manage user roles (student, teacher, admin)</li>
              <li>Send email notifications regarding account approval, rejection, or important updates</li>
              <li>Ensure platform security and prevent unauthorized access</li>
              <li>Analyze usage patterns to improve our courses and features</li>
            </ul>
          </section>

          <section>
            <h2>4. Information Sharing & Disclosure</h2>
            <p>We do not sell, trade, or rent your personal information. We may share your information in the following cases:</p>
            <ul>
              <li><strong>Teachers & Admins:</strong> Teachers can view the progress and performance of students enrolled in their courses. Admins can view all user profiles for platform management purposes.</li>
              <li><strong>Service Providers:</strong> We may share data with trusted third-party service providers who assist in operating the Platform (e.g., email delivery services), subject to confidentiality agreements.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law, regulation, or legal process, or to protect the rights, safety, or property of LearnHub, our users, or the public.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information,
              including:
            </p>
            <ul>
              <li>Password hashing using industry-standard algorithms (Werkzeug/PBKDF2)</li>
              <li>Token-based authentication for API access</li>
              <li>CORS policies to restrict unauthorized cross-origin requests</li>
              <li>HTTPS encryption for data in transit</li>
              <li>Role-based access controls (student, teacher, admin)</li>
            </ul>
            <p>
              While we strive to protect your data, no method of electronic storage or transmission is 100% secure.
              We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as needed to provide
              services. Course progress, quiz attempts, and activity logs are retained to maintain your learning
              history. You may request deletion of your account and associated data by contacting us.
            </p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li>Access, update, or correct your personal information</li>
              <li>Request deletion of your account and personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Withdraw consent for email communications</li>
              <li>Request a portable copy of your data</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at the email address provided below.
            </p>
          </section>

          <section>
            <h2>8. Children's Privacy</h2>
            <p>
              The Platform is not intended for children under the age of 13. We do not knowingly collect personal
              information from children under 13. If we discover that we have collected data from a child under 13,
              we will delete it promptly. If you believe a child has provided us with personal information, please
              contact us immediately.
            </p>
          </section>

          <section>
            <h2>9. Third-Party Services</h2>
            <p>
              Our Platform may contain links to third-party websites or embed third-party content (e.g., YouTube
              videos for course lessons). We are not responsible for the privacy practices of these third parties.
              We encourage you to review their privacy policies before providing any personal information.
            </p>
          </section>

          <section>
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by
              posting the updated policy on this page with a revised "Last updated" date. Your continued use of the
              Platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2>11. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="legal-contact-box">
              <p><strong>LearnHub</strong></p>
              <p>Email: privacy@learnhub.com</p>
              <p>Website: learnhub.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
