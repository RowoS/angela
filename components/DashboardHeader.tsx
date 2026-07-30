import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
    menuItem: string;
}

export default function DashboardHeader({ menuItem }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-row justify-between w-full h-14 px-4 items-center bg-white shadow-[0_0.5px_0_0_rgba(0,0,0,0.3)]">
                <span className='flex flex-col justify-center font-redhat font-extrabold text-base text-[#040404]'>
                    {menuItem}
                </span>
                <Button variant="secondary" size="icon" className='bg-white'>
                    <Bell />
                </Button>
            </div>
        </div>
    )
}