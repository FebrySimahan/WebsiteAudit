import { Separator } from "@/components/ui/separator";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, FolderSearch, ChartBar } from "lucide-react";

interface SidebarProps {
    isOpen?: boolean;
}

const Sidebar = ({ isOpen = true }: SidebarProps) => {
    return (
        <aside className={`w-full md:min-h-screen border-b md:border-b-0 md:border-r bg-white flex flex-col transition-all duration-300 overflow-hidden ${isOpen ? "md:w-64 p-4 max-h-full" : "md:w-20 md:p-0 md:items-center md:max-h-full max-h-0"}`}>
            <div className={`mb-6 flex items-center gap-3 ${isOpen ? "" : "md:justify-center"}`}>
                <div className="mt-3 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src="/src/assets/picture/msa.png" alt="Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                {isOpen && (
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold">Dashboard</h2>
                        <p className="text-sm text-muted-foreground text-black">
                            Sistem Audit Internal
                        </p>
                    </div>
                )}
            </div>

            {isOpen && <Separator className="mb-4" />}

            <nav className={`flex flex-col gap-2 w-full ${isOpen ? "" : "md:items-center"}`}>
                <NavLink
                    to="/direksi/dashboard"
                    title="Dashboard"
                    className={`flex items-center justify-center gap-3 rounded-md 
                    hover:bg-blue-900 hover:text-white transition-colors text-sm md:text-lg ${isOpen ? "md:justify-start px-4 py-3" : "md:p-2"}`}>
                    <LayoutDashboard className={`flex-shrink-0 ${isOpen ? "w-6 h-6" : "hidden md:inline w-6 h-6"}`} />
                    {isOpen && <span className="hidden md:inline">Dashboard</span>}
                </NavLink>

                <NavLink
                    to="/direksi/permintaan-data"
                    title="Permintaan Data"
                    className={`flex items-center justify-center gap-3 rounded-md 
                    hover:bg-blue-900 hover:text-white transition-colors text-sm md:text-lg ${isOpen ? "md:justify-start px-4 py-3" : "md:p-2"}`}>
                    <FileText className={`flex-shrink-0 ${isOpen ? "w-6 h-6" : "hidden md:inline w-6 h-6"}`} />
                    {isOpen && <span className="hidden md:inline">Ikthisar Temuan</span>}
                </NavLink>

                <NavLink
                    to="/direksi/temuan-data"
                    title="Temuan Data"
                    className={`flex items-center justify-center gap-3 rounded-md 
                    hover:bg-blue-900 hover:text-white transition-colors text-sm md:text-lg ${isOpen ? "md:justify-start px-4 py-3" : "md:p-2"}`}>
                    <FolderSearch className={`flex-shrink-0 ${isOpen ? "w-6 h-6" : "hidden md:inline w-6 h-6"}`} />
                    {isOpen && <span className="hidden md:inline">Temuan Data</span>}
                </NavLink>

                <NavLink
                    to="/scoreboard-direksi"
                    title="Scoreboard"
                    className={`flex items-center justify-center gap-3 rounded-md 
                    hover:bg-blue-900 hover:text-white transition-colors text-sm md:text-lg ${isOpen ? "md:justify-start px-4 py-3" : "md:p-2"}`}>
                    <ChartBar className={`flex-shrink-0 ${isOpen ? "w-6 h-6" : "hidden md:inline w-6 h-6"}`} />
                    {isOpen && <span className="hidden md:inline">Scoreboard</span>}
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
