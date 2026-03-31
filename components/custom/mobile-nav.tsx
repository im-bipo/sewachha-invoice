"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItem = {
  key: string;
  label: string;
  href: string;
};

type MobileNavProps = {
  items: NavItem[];
  activeKey: string;
};

export function MobileNav({ items, activeKey }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleMenu}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Mobile Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 z-30 bg-black/20 md:hidden"
            onClick={closeMenu}
          />

          {/* Menu Content */}
          <nav className="absolute left-0 right-0 top-16 z-40 border-b border-border/70 bg-white p-4 md:hidden">
            <div className="space-y-2">
              {items.map((item) => {
                const isActive = item.key === activeKey;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={closeMenu}
                    className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-muted/70"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
