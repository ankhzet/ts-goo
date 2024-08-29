import Link from 'next/link';
import { NavLinks } from './NavLinks';
import Image from 'next/image';

export function SideNav() {
    return (
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
            <Link
                className="overflow-hidden relative mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-40"
                href="/"
            >
                <Image
                    src="/board.png"
                    alt="PCB Board render"
                    width={974}
                    height={484}
                    style={{ objectFit: 'cover' }}
                    className="absolute top-0 left-0 w-full h-full z-0"
                />

                <div className="w-32 text-white md:w-40 mt-4 z-10">
                    PCB Hub
                </div>
            </Link>
            <div className="flex grow flex-row space-x-2 md:flex-col md:space-x-0 md:space-y-2">
                <NavLinks />
            </div>
        </div>
    );
}
