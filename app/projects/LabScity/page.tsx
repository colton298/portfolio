import styles from "./page.module.css";

export const metadata = {
  title: "CS - About LabScity",
};

export default function LabScityPage() {
  return (
    <main className={styles.page}>
      <div className={styles.stack}>
        <section className={styles.card}>
          <h2 className={styles.title}>About LabScity</h2>

          <p className={styles.bodyText}>
            LabScity is my senior design project. Our sponsor, Dr.
            Sharanowski, had an idea for a scientist-focused social media
            website. Her concept was focused around avoiding the pitfalls of
            modern social media apps, like:
          </p>

          <ul className={styles.list}>
            <li className={styles.listItem}>Overwhelming user interface</li>
            <li className={styles.listItem}>
              Invasive tracking and data collection
            </li>
            <li className={styles.listItem}>
              Unfiltered content and minimal moderation
            </li>
          </ul>

          <p className={styles.bodyText}>
            We did, however, want to uplift certain policies for a social media
            app built for researchers, such as:
          </p>

          <ul className={styles.list}>
            <li className={styles.listItem}>Science-focused content</li>
            <li className={styles.listItem}>
              Quick and easy methods to find collaborators
            </li>
            <li className={styles.listItem}>
              The ability to quickly discover what&apos;s new in scientific
              fields.
            </li>
          </ul>

          <p className={styles.bodyText}>
            The result is LabScity, a social media app built for scientists.
          </p>
        </section>

        <section className={styles.card}>
          <h2 className={styles.title}>My Contribution</h2>

          <p className={styles.bodyText}>
            My contribution to this project was a combination of project
            manager and developer work. First, I worked with our sponsor to get
            finite details for a minimum viable product and stretch goals. Then,
            I worked with my team to translate this MVP into finite details of
            the project, including an implementation strategy.
          </p>
          <p className={styles.bodyText}>
            Once we began building LabScity, I worked on several aspects of the project:
          </p>
          <ul className={styles.list}>
            <li className={styles.listItem}>Home, Groups, Notifications, Forgot-Password pages</li>
            <li className={styles.listItem}>Manage our team&apos;s Jira Scrum board, keeping the team on track for each sprint </li>
            <li className={styles.listItem}>Holding meetings, keeping notes of meeting topics and decisions</li>
          </ul>
          <p className={styles.bodyText}>
            Throughout the year, I balanced project management and developer work to help produce a social media website built from the ground up. 
          </p>
        </section>
      </div>
    </main>
  );
}
