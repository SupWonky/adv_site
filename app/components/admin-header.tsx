import { Link } from "react-router";
import { siteConfig } from "~/config/site";
import { User } from "./user";

export function AdminHeader() {
  return (
    <div className="top-0 z-50 w-full bg-background/90 supports-[backdrop-filter]:bg-background/65 sticky backdrop-blur border-b">
      <div className="container flex h-14 items-center">
        <div className="hidden lg:flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold">{siteConfig.name}</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between md:justify-end">
          <User />
        </div>
      </div>
    </div>
  );
}
