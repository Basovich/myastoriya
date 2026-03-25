'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
    const pathname = usePathname();
    const isHome = pathname === '/';

    const logoContent = (
        <Image
            src="/images/logo-white.svg"
            alt="М'ясторія"
            width={114}
            height={33}
            priority
        />
    );

    if (isHome) {
        return <span>{logoContent}</span>;
    }

    return (
        <Link href="/">
            {logoContent}
        </Link>
    );
}
