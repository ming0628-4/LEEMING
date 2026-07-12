"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/archive", label: "资源库" },
  { href: "/archive", label: "搜索" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="menu-button"
        type="button"
        aria-expanded={open}
        aria-controls="site-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "关闭" : "菜单"}
      </button>
      <nav
        id="site-navigation"
        className={open ? "nav-links is-open" : "nav-links"}
        aria-label="主导航"
      >
        {links.map((link, index) => (
          <Link key={`${link.label}-${index}`} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
