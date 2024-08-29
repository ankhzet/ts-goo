import { inter } from '@/app/ui/fonts';

import '@/app/ui/global.css';

export default function RootLayout({ children }: React.PropsWithChildren) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased overflow-hidden`}>{children}</body>
        </html>
    );
}
