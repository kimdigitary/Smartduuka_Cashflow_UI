import React from "react";
import { FaSearch } from "react-icons/fa";

export function EmptyState({ title, description, action }: any) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-muted/50 p-4 rounded-full mb-4">
                <FaSearch className="text-muted-foreground text-3xl opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}