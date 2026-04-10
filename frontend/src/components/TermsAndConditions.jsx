import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
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
          <h1>Terms and Conditions</h1>
          <p className="legal-updated">Last updated: April 10, 2026</p>
        </div>

        <div className="legal-content">
          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By creating an account, accessing, or using the LearnHub learning management system platform
              (the "Platform"), you agree to be bound by these Terms and Conditions ("Terms"). If you do not
              agree to these Terms, you must not use the Platform.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you ("User," "you," or "your") and
              LearnHub ("we," "our," or "us"). We reserve the right to modify these Terms at any time, and
              your continued use of the Platform constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2>2. User Accounts</h2>
            <h3>2.1 Registration</h3>
            <p>
              To access most features of the Platform, you must register for an account by providing accurate
              and complete information including your full name, email address, and a secure password. You are
              responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h3>2.2 Account Approval</h3>
            <p>
              New student and teacher accounts are subject to review and approval by platform administrators.
              We reserve the right to approve or reject any account registration at our sole discretion. You
              will be notified by email of your account status.
            </p>

            <h3>2.3 User Roles</h3>
            <p>The Platform supports three user roles with distinct permissions:</p>
            <ul>
              <li><strong>Students:</strong> Can browse courses, enroll, watch lessons, take quizzes, and track learning progress.</li>
              <li><strong>Teachers:</strong> Can create and manage courses, upload lessons, create quizzes, view student performance, provide feedback, and schedule exams.</li>
              <li><strong>Administrators:</strong> Can manage all users, approve or reject registrations, view platform-wide statistics, and moderate content.</li>
            </ul>

            <h3>2.4 Account Responsibility</h3>
            <p>
              You are solely responsible for all activities that occur under your account. You must immediately
              notify us of any unauthorized use of your account or any other security breach. We are not liable
              for any loss arising from unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2>3. Platform Usage</h2>
            <h3>3.1 Permitted Use</h3>
            <p>You may use the Platform solely for:</p>
            <ul>
              <li>Enrolling in and completing educational courses</li>
              <li>Accessing and viewing lesson content (videos, text materials)</li>
              <li>Taking quizzes and assessments</li>
              <li>Tracking your learning progress and performance</li>
              <li>Creating and managing educational content (for teachers)</li>
              <li>Managing the platform and its users (for administrators)</li>
            </ul>

            <h3>3.2 Prohibited Conduct</h3>
            <p>You agree not to:</p>
            <ul>
              <li>Share your account credentials with any third party</li>
              <li>Attempt to gain unauthorized access to other users' accounts or platform systems</li>
              <li>Reproduce, distribute, or publicly display course content without authorization</li>
              <li>Use automated tools, bots, or scrapers to access the Platform</li>
              <li>Upload malicious content, malware, or harmful code</li>
              <li>Harass, intimidate, or submit abusive feedback to other users</li>
              <li>Misrepresent your identity, qualifications, or role</li>
              <li>Use the Platform for any unlawful purpose</li>
              <li>Interfere with or disrupt the Platform's infrastructure or services</li>
              <li>Attempt to reverse-engineer, decompile, or modify the Platform's software</li>
            </ul>
          </section>

          <section>
            <h2>4. Course Content</h2>
            <h3>4.1 Content Ownership</h3>
            <p>
              Course content (including lessons, videos, quizzes, and materials) is the intellectual property
              of the respective course creators (teachers) or LearnHub. Enrolled students are granted a limited,
              non-exclusive, non-transferable license to access course content for personal educational purposes only.
            </p>

            <h3>4.2 Teacher-Created Content</h3>
            <p>
              Teachers who create courses on the Platform retain ownership of their original content. By uploading
              content to the Platform, teachers grant LearnHub a non-exclusive, worldwide license to host, display,
              and distribute the content through the Platform for educational purposes.
            </p>

            <h3>4.3 Third-Party Content</h3>
            <p>
              Courses may include embedded third-party content (e.g., YouTube videos). Such content is subject to
              the respective third party's terms of service. LearnHub is not responsible for the availability or
              accuracy of third-party content.
            </p>
          </section>

          <section>
            <h2>5. Quizzes and Assessments</h2>
            <p>
              Quiz scores, attempt records, and performance data are recorded and stored on the Platform.
              Teachers and administrators may access student quiz data for educational evaluation purposes.
              Quiz results are final once submitted. Each quiz attempt is logged with the score, number of
              correct answers, pass/fail status, and completion timestamp.
            </p>
          </section>

          <section>
            <h2>6. Teacher Responsibilities</h2>
            <p>If you register as a teacher, you additionally agree to:</p>
            <ul>
              <li>Provide accurate qualification and experience information during registration</li>
              <li>Create course content that is original, accurate, and appropriate for educational purposes</li>
              <li>Provide constructive and professional feedback to students</li>
              <li>Maintain the quality and accuracy of your course materials</li>
              <li>Not upload content that infringes on intellectual property rights of others</li>
              <li>Comply with all applicable laws and educational standards</li>
            </ul>
          </section>

          <section>
            <h2>7. Privacy</h2>
            <p>
              Your use of the Platform is also governed by our{' '}
              <Link to="/privacy-policy" className="legal-inline-link">Privacy Policy</Link>,
              which describes how we collect, use, and protect your personal information. By using the Platform,
              you consent to the data practices described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2>8. Account Suspension & Termination</h2>
            <p>We reserve the right to suspend or terminate your account if you:</p>
            <ul>
              <li>Violate any of these Terms and Conditions</li>
              <li>Engage in fraudulent, abusive, or harmful behavior</li>
              <li>Provide false or misleading information during registration</li>
              <li>Fail to comply with applicable laws or regulations</li>
            </ul>
            <p>
              Upon termination, your access to the Platform will be revoked. We may retain certain data as
              required by law or for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2>9. Disclaimers</h2>
            <h3>9.1 Platform Availability</h3>
            <p>
              The Platform is provided on an "as is" and "as available" basis. We do not guarantee that the
              Platform will be uninterrupted, error-free, or free of harmful components. We reserve the right
              to modify, suspend, or discontinue any part of the Platform at any time without prior notice.
            </p>

            <h3>9.2 Educational Content</h3>
            <p>
              LearnHub does not guarantee the accuracy, completeness, or quality of any course content.
              Course content is provided for educational purposes only and should not be considered
              professional advice. Learning outcomes depend on individual effort and engagement.
            </p>

            <h3>9.3 No Certification Guarantee</h3>
            <p>
              Unless explicitly stated, completing courses on LearnHub does not result in accredited
              certifications, degrees, or professional qualifications.
            </p>
          </section>

          <section>
            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, LearnHub and its officers, directors, employees, and
              agents shall not be liable for any indirect, incidental, special, consequential, or punitive
              damages arising from your use of the Platform, including but not limited to loss of data,
              revenue, or learning progress.
            </p>
            <p>
              Our total liability for any claim arising from these Terms or your use of the Platform shall
              not exceed the amount you have paid to LearnHub in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless LearnHub and its affiliates from any claims,
              damages, losses, or expenses (including reasonable legal fees) arising from your violation of
              these Terms, your use of the Platform, or your infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India, without
              regard to its conflict of law provisions. Any disputes arising from these Terms or your use of
              the Platform shall be resolved exclusively in the courts located in India.
            </p>
          </section>

          <section>
            <h2>13. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining
              provisions shall continue in full force and effect.
            </p>
          </section>

          <section>
            <h2>14. Contact Information</h2>
            <p>
              For questions or concerns regarding these Terms and Conditions, please contact us at:
            </p>
            <div className="legal-contact-box">
              <p><strong>LearnHub</strong></p>
              <p>Email: legal@learnhub.com</p>
              <p>Website: learnhub.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
