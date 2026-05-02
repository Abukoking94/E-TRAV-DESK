import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { SectionHeading } from "../components/ui/SectionHeading";

export function NotFoundPage() {
  return (
    <section className="section-space">
      <div className="page-shell">
        <SectionHeading
          eyebrow="404"
          title="This destination fell off the map."
          description="The route does not exist yet, but the app shell is ready for many more product surfaces."
        />
        <div className="mt-8">
          <Link to="/">
            <Button>Return home</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
