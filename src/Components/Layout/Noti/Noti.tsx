import { useEffect, useState } from "react";
import { Tabs } from "flowbite";
import type { TabsOptions, TabItem } from "flowbite";
import { useTheme } from "../../../context/ThemeContext";
import React from "react";

export default function Notification() {
    useEffect(() => {
        
        const tabsElement = document.getElementById("default-tab");
        if (tabsElement) {
            const tabElements: TabItem[] = [
                {
                    id: "today",
                    triggerEl: document.getElementById("Today-tab")!,
                    targetEl: document.getElementById("today")!,
                },
                {
                    id: "all",
                    triggerEl: document.getElementById("All-tab")!,
                    targetEl: document.getElementById("all")!,
                },
            ];

            const options: TabsOptions = {
                defaultTabId: "today",
                activeClasses: "text-blue-600 border-blue-600",
                inactiveClasses: "text-gray-500 border-transparent",
            };

            new Tabs(tabsElement, tabElements, options);
        }
    }, []);

    // Dữ liệu thông báo
    const notifications = [
        {
            id: 1,
            avatar: "https://i.pravatar.cc/40?img=1",
            name: "Nguyễn Văn A",
            message: "đã bắt đầu theo dõi bạn",
        },
        {
            id: 2,
            avatar: "https://i.pravatar.cc/40?img=2",
            name: "Trần Thị B",
            message: "đã bắt đầu theo dõi bạn",
        },
        {
            id: 3,
            avatar: "https://i.pravatar.cc/40?img=3",
            name: "Phạm Văn C",
            message: "đã bắt đầu theo dõi bạn",
        },
    ];

    const [followedUsers, setFollowedUsers] = useState<number[]>([]);
    const { theme } = useTheme();

    const handleFollow = (userId: number) => {
        setFollowedUsers((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    return (
        <div className=" flex flex-col min-h-screen p-4">
            <h1 className="ps-4 text-lg font-semibold">Thông báo</h1>

            {/* Tabs */}
            <div className="mb-4 border-b border-gray-700">
                <ul
                    className="flex flex-wrap -mb-px text-sm font-medium text-center"
                    id="default-tab"
                    role="tablist"
                >
                    <li className="mr-2" role="presentation">
                        <button
                            className="inline-block p-4 border-b-2 rounded-t-lg active"
                            id="Today-tab"
                            type="button"
                            role="tab"
                            aria-controls="today"
                            aria-selected="true"
                        >
                            Hôm nay
                        </button>
                    </li>
                    <li className="mr-2" role="presentation">
                        <button
                            className="inline-block p-4 border-b-2 rounded-t-lg hover:text-gray-400 hover:border-gray-500"
                            id="All-tab"
                            type="button"
                            role="tab"
                            aria-controls="all"
                            aria-selected="false"
                        >
                            Tất cả
                        </button>
                    </li>
                </ul>
            </div>

            {/* Nội dung của các tab */}
            <div>
                {/* Tab "Hôm nay" */}
                <div className="p-4 space-y-3 rounded-lg" id="today" role="tabpanel">
                    {notifications.map((noti) => (
                        <div key={noti.id} className= {`flex items-center p-3  rounded-lg shadow-md ${theme === "dark" ? "bg-black " : "bg-white "}`}>
                            <img src={noti.avatar} alt="Avatar" className="w-10 h-10 rounded-full me-3" />
                            <span className="text-sm text-gray-500 ">
                                <strong className="text-gray-500">{noti.name}</strong> {noti.message}
                            </span>
                            <button
                            className={`px-3 py-1 rounded-lg flex items-center gap-2 ms-auto ${followedUsers.includes(noti.id) ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
                                } text-white`}
                            onClick={() => handleFollow(noti.id)}
                            >
                                {followedUsers.includes(noti.id) ? <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5" />
                                </svg> : <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path fill-rule="evenodd" d="M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H7Zm8-1a1 1 0 0 1 1-1h1v-1a1 1 0 1 1 2 0v1h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 0 1-1-1Z" clip-rule="evenodd" />
                                </svg>}
                                <span>{followedUsers.includes(noti.id) ? "Đang theo dõi" : "Follow"}</span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Tab "Tất cả" */}
                <div className="hidden p-4 space-y-3 rounded-lg" id="all" role="tabpanel">
                    {notifications.map((noti) => (
                        <div key={noti.id} className= {`flex items-center p-3  rounded-lg shadow-md ${theme === "dark" ? "bg-black " : "bg-white "}`}>
                            <img src={noti.avatar} alt="Avatar" className="w-10 h-10 rounded-full me-3" />
                            <span className="text-sm text-gray-500">
                                <strong className="text-gray-500">{noti.name}</strong> {noti.message}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
