import { useState } from "react"
import Sidebar from "./SidebarDireksi.tsx"
import Navbar from "../Navbar.tsx"

export default function Layout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth >= 768
        }
        return false
    })

    return (
        <div className="flex flex-col min-h-screen">

            <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <div className="flex flex-col md:flex-row flex-1">

                <div className={`
                    transition-all duration-300 overflow-visible
                    border-b md:border-b-0 md:border-r bg-white
                    md:min-h-screen
                    ${sidebarOpen
                        ? "w-full md:w-64"
                        : "w-full md:w-20"
                    }
                `}>
                    <Sidebar isOpen={sidebarOpen} />
                </div>


                <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    )
}