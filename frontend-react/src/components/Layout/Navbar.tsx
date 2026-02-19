import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, LogOut } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authUtils } from "@/services/api"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavbarProps {
    onMenuClick: () => void
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const navigate = useNavigate()
    const [userName, setUserName] = useState<string>("")

    useEffect(() => {
        const loadUser = async () => {
            const user = await authUtils.getUser()
            if (user?.name) {
                setUserName(user.name)
            }
        }
        loadUser()
    }, [])

    const handleLogout = async () => {
        await authUtils.logout()
        navigate("/login")
    }

    return (
        <nav className="border-b bg-cyan-500 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="rounded-lg"
                >
                    <Menu size={24} />
                </Button>

                <div className="flex items-center gap-4">
                    {userName && (
                        <div className="flex items-center gap-3">
                            <span className="text-white text-lg font-bold">Hello {userName}!</span>
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                        </div>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Menu
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}