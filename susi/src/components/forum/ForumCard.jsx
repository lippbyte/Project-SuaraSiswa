import { memo, useCallback } from "react";
import CardDiskusi from "./CardDiskusi";
import CardMusyawarah from "./CardMusyawarah";
import CardDemos from "./CardDemos";
import CardLaporan from "./CardLaporan";

const ForumCard = memo(({ card, setPageFunc, setCardData, user }) => {
    const handleOpen = useCallback(() => {
        if (typeof setCardData === "function") setCardData(card);
        if (typeof setPageFunc === "function") {
            setPageFunc(`/${card.type}/${card.id}`, card);
        }
    }, [card, setCardData, setPageFunc]);

    const handleDelete = useCallback(async (e) => {
        e.stopPropagation();
        if (!confirm("Apakah Anda yakin ingin menghapus postingan ini?")) return;
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/posts/${card.id}`,
                { method: "DELETE" }
            );
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.error || "Gagal menghapus postingan.");
            }
            // UI update ditangani oleh socket event 'post:delete' di App.jsx
        } catch (err) {
            console.error(err);
            alert("Gagal menghapus postingan. Periksa koneksi server.");
        }
    }, [card.id]);

    const renderCardByType = () => {
        switch (card.type) {
            case "diskusi":
                return (
                    <CardDiskusi
                        card={card}
                        onClick={handleOpen}
                        onDelete={handleDelete}
                        user={user}
                    />
                );
            case "musyawarah":
                return (
                    <CardMusyawarah
                        card={card}
                        onClick={handleOpen}
                        onDelete={handleDelete}
                        user={user}
                    />
                );
            case "demos":
                return (
                    <CardDemos
                        card={card}
                        onClick={handleOpen}
                        onDelete={handleDelete}
                        user={user}
                    />
                );
            case "laporan":
                return (
                    <CardLaporan
                        card={card}
                        onClick={handleOpen}
                        onDelete={handleDelete}
                        user={user}
                    />
                );
            default:
                return (
                    <CardDiskusi
                        card={card}
                        onClick={handleOpen}
                        onDelete={handleDelete}
                        user={user}
                    />
                );
        }
    };

    return (
        <div className="forum-card-container h-full">
            {renderCardByType()}
        </div>
    );
});

ForumCard.displayName = "ForumCard";

export default ForumCard;
