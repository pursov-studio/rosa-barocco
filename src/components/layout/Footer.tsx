import { Link } from "@tanstack/react-router";
import { Container } from "@/components/common/Container";
import { BRAND } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-muted/40">
      <Container className="grid gap-10 py-12 sm:grid-cols-3">
        <div>
          <div className="font-display text-xl">
            ROSA<span className="text-primary">&</span>BAROCCO
          </div>
          <p className="mt-2 text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            Cosmetic Lab
          </p>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            {BRAND.description}
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-widest text-foreground/80">
            Навигация
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/catalog" className="text-muted-foreground hover:text-foreground">Каталог</Link></li>
            <li><Link to="/delivery" className="text-muted-foreground hover:text-foreground">Доставка и оплата</Link></li>
            <li><Link to="/cooperation" className="text-muted-foreground hover:text-foreground">Сотрудничество</Link></li>
            <li><Link to="/contacts" className="text-muted-foreground hover:text-foreground">Контакты</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm uppercase tracking-widest text-foreground/80">
            Контакты
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={`mailto:${BRAND.email}`} className="text-muted-foreground hover:text-foreground">
                {BRAND.email}
              </a>
            </li>
            <li>
              <a href={`tel:${BRAND.phoneRaw}`} className="text-muted-foreground hover:text-foreground">
                {BRAND.phone}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border/60">
        <Container className="flex flex-col items-start justify-between gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} ROSA&BAROCCO. Все права защищены.</span>
          <span>Натуральная косметика</span>
        </Container>
      </div>
    </footer>
  );
}
