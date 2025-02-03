const UsersListSkeleton = () => {
    return Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 justify-center lg:justify-start p-3 rounded-lg animate-pulse">
            <div className="h-12 w-12 rounded-full bg-zinc-800" />
            <div className="flex-1 lg:block hidden">
                <div className="h-4 bg-zinc-800 rounded w-24 mb-2" />
                <div className="h-3 bg-zinc-800 rounded w-32" />
            </div>
        </div>
    ));
};

export default UsersListSkeleton