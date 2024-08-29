import { SideNav } from '@/app/ui/dashboard';

export default function Layout({ children }: React.PropsWithChildren) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <SideNav />
            </div>
            <div className="flex-grow p-3 md:overflow-y-auto">{children}</div>
        </div>
    );
}
