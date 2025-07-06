import { Link } from "react-router";
import { siteConfig } from "~/config/site";
import { MapPinIcon, PhoneIcon, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { useModal } from "./providers/modal-provider";

export function MainNav() {
  const { setModal } = useModal();

  return (
    <div className="flex flex-row items-center justify-between">
      {/* Logo and description */}
      <div className="hidden md:flex items-center gap-4">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold">{siteConfig.name}</span>
        </Link>
        <div className="max-w-64 ml-8 hidden xl:block">
          <p className="text-sm text-muted-foreground">
            Проектирование, продажа оборудования и монтаж инженерных систем в
            Московской области и УрФО
          </p>
        </div>
      </div>

      <div className="flex gap-2 ml-auto mr-6 xl:mx-0">
        <MapPinIcon className="w-4 h-4 text-primary mt-1" />
        <div className="text-sm max-w-36">
          <p>г. Тюмень, ул. Перекопская, д. 52, офис 34</p>
        </div>
      </div>

      {/* Contact information */}
      <div className="flex flex-row gap-6 items-center">
        {/* Location */}

        {/* Phone */}
        <div className="flex items-center gap-2">
          <PhoneIcon className="w-4 h-4 text-primary" />
          <div className="text-sm">
            <p className="font-semibold">{siteConfig.phone}</p>
            <p className="text-xs text-muted-foreground">
              Пн. — Вс. с 9:00 до 18:00
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          <a href={`mailto:${siteConfig.mail}`} className="text-sm">
            {siteConfig.mail}
          </a>
        </div>

        {/* Call-to-action button */}
        <Button variant="outline" onClick={() => setModal("call")}>
          Заказать звонок
        </Button>
      </div>
    </div>
  );
}
