import { useState } from "react";
import { Link } from "react-router";
import { Phone, MapPin, Mail } from "lucide-react";

interface FooterLinkGroup {
  title: string;
  links: {
    text: string;
    href: string;
  }[];
}

interface FooterContactProps {
  companyLinks?: FooterLinkGroup;
  serviceLinks?: FooterLinkGroup;
  projectLinks?: FooterLinkGroup;
  contactInfo?: {
    phone: string;
    address: string;
    email: string;
    workHours: string;
  };
}

export function Footer({
  companyLinks = {
    title: "О компании",
    links: [
      { text: "Новости", href: "/news" },
      { text: "Лицензии", href: "/licenses" },
      { text: "Отзывы", href: "/reviews" },
      { text: "Реквизиты", href: "/requisites" },
      { text: "Клиенты", href: "/clients" },
      { text: "Партнеры", href: "/partners" },
      { text: "Вакансии", href: "/vacancies" },
      { text: "Нормативные документы", href: "/documents" },
    ],
  },
  serviceLinks = {
    title: "Услуги",
    links: [
      { text: "Инженерные системы", href: "/services/engineering-systems" },
      { text: "Вентиляция", href: "/services/ventilation" },
      { text: "Дымоудаление", href: "/services/smoke-extraction" },
      { text: "Кондиционирование", href: "/services/air-conditioning" },
      { text: "Отопление", href: "/services/heating" },
      { text: "Строительство арочных ангаров", href: "/services/arch-hangars" },
      { text: "Увлажнение и осушение", href: "/services/humidification" },
      { text: "Водоснабжение", href: "/services/water-supply" },
      { text: "Электроснабжение", href: "/services/power-supply" },
    ],
  },
  projectLinks = {
    title: "Проекты",
    links: [
      { text: "Монтаж вентиляции", href: "/projects/ventilation-installation" },
      {
        text: "Монтаж воздушного отопления",
        href: "/projects/air-heating-installation",
      },
      {
        text: "Монтаж дымоудаления",
        href: "/projects/smoke-extraction-installation",
      },
      {
        text: "Обслуживание вентиляции",
        href: "/projects/ventilation-maintenance",
      },
      {
        text: "Проектирование вентиляции",
        href: "/projects/ventilation-design",
      },
    ],
  },
  contactInfo = {
    phone: "+7 (3452) 531-331",
    address: "г. Тюмень, ул. Перекопская, д. 52, офис 34",
    email: "tmn@avante.pro",
    workHours: "Пн. – Вс. с 9:00 до 18:00",
  },
}: FooterContactProps) {
  const [year] = useState(new Date().getFullYear());

  return (
    <footer className="bg-zinc-900 py-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Information */}
          <div>
            <h3 className="text-white font-medium mb-4">
              {companyLinks.title}
            </h3>
            <ul className="space-y-2">
              {companyLinks.links.map((link) => (
                <li key={link.text}>
                  <Link
                    to={link.href}
                    className="hover:text-white text-sm text-muted-foreground transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-medium mb-4">
              {serviceLinks.title}
            </h3>
            <ul className="space-y-2">
              {serviceLinks.links.map((link) => (
                <li key={link.text}>
                  <Link
                    to={link.href}
                    className="hover:text-white text-sm text-muted-foreground transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects */}
          <div>
            <h3 className="text-white font-medium mb-4">
              {projectLinks.title}
            </h3>
            <ul className="space-y-2">
              {projectLinks.links.map((link) => (
                <li key={link.text}>
                  <Link
                    to={link.href}
                    className="hover:text-white text-sm text-muted-foreground transition-colors"
                  >
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">
              Оставайтесь на связи
            </h3>
            <div className="flex flex-col space-y-5">
              {/* Contact Buttons */}
              <div className="flex space-x-3">
                <a
                  href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, "")}`}
                  className="bg-purple-600 hover:bg-purple-700 transition-colors rounded-full p-3"
                  aria-label="Call us"
                >
                  <Phone size={20} />
                </a>
                <a
                  href="https://wa.me/73452531331"
                  className="bg-green-600 hover:bg-green-700 transition-colors rounded-full p-3"
                  aria-label="Contact us via WhatsApp"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Contact Information */}
          </div>

          <div className="space-y-4">
            {/* Phone Number */}
            <h3 className="text-white font-medium">Наши контакты</h3>
            <div>
              <a
                href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, "")}`}
                className="flex items-center space-x-2"
              >
                <Phone className="size-4 text-muted-foreground" />
                <span className="font-medium text-white">
                  {contactInfo.phone}
                </span>
              </a>
              <p className="text-xs mt-1 py-4 px-6 text-muted-foreground">
                {contactInfo.workHours}
              </p>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-2">
              <MapPin className="mt-1 flex-shrink-0 text-muted-foreground size-4" />
              <span className="text-white text-sm">{contactInfo.address}</span>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-2">
              <Mail className="mt-1 flex-shrink-0 text-muted-foreground size-4" />
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-white text-sm"
              >
                {contactInfo.email}
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Row */}
        <div className="mt-12 pt-6 border-t border-muted-foreground text-muted-foreground flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs">© {year} Все права защищены.</p>
          <div className="mt-4 md:mt-0 flex items-center">
            <span className="text-sm mr-2">Продвижение сайтов</span>
            <a href="https://artena.ru/" className="text-white">
              <svg width="100" height="20" viewBox="0 0 100 20">
                <text
                  x="0"
                  y="15"
                  fill="white"
                  fontFamily="Arial"
                  fontWeight="bold"
                >
                  АРТЕНА
                </text>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
