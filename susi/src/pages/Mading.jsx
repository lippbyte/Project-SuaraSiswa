import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { useMemo } from "react";
import { useMediaQuery } from "usehooks-ts";
import { FaUser } from "react-icons/fa";
import Pin from '../components/Pin';

function Card({ card, setPageFunc, setCardData }) {
    const { type, title, text, sender, vote } = card;
    const isMedium = useMediaQuery('(min-width: 768px)');
    const isLarge = useMediaQuery('(min-width: 1024px)');
    const bgColors = { diskusi: '#5C7A6B', laporan: '#C0392B', musyawarah: '#6B3F72', demos: '#D4A843' };
    const bgColor = bgColors[type];
    const { rotation, randomAlign, width, randomMargin } = useMemo(() => {
        const angle = Math.floor(Math.random() * 6) + 1;
        const aligns = ['flex-start', 'center', 'flex-end'];
        const baseWidth = isLarge ? 380 : isMedium ? 280 : 160;
        return {
            rotation: Math.random() > 0.5 ? angle : -angle,
            randomAlign: aligns[Math.floor(Math.random() * aligns.length)],
            width: baseWidth * Math.min(1 + (vote / 100), 1.5),
            randomMargin: {
                marginTop: `${Math.floor(Math.random() * 25)}px`,
                marginBottom: `${Math.floor(Math.random() * 25)}px`,
                marginLeft: `${Math.floor(Math.random() * 25)}px`,
                marginRight: `${Math.floor(Math.random() * 25)}px`,
            }
        };
    }, [isLarge, isMedium, vote]);

    return (
        <div 
            onClick={() => { setCardData(card); setPageFunc(type); }}
            style={{ backgroundColor: bgColor, width: `${width}px`, rotate: `${rotation}deg`, alignSelf: randomAlign, ...randomMargin }} 
            className='card-container aspect-square lg:aspect-video flex flex-col bg-primary rounded-xl shadow-2xl p-3 text-light gap-1 cursor-pointer hover:scale-105 transition-transform duration-200'
        >
            <h2 className="font-bold text-lg md:text-2xl truncate">{title}</h2>
            <p className="text-light-100 line-clamp-3">{text}</p>
            <div className="flex justify-between items-center mt-auto">
                <div className="font-bold">
                    <p className="flex items-center gap-2 capitalize"><FaUser />{sender} · {type}</p>
                </div>
                <div className="flex items-center gap-2 hover:brightness-200">
                    <FaRegArrowAltCircleUp />
                    <p>{vote}</p>
                </div>
            </div>
            <div className="pin-container absolute -top-2 -right-2 scale-125">
                <Pin />
            </div>
        </div>
    );
};

export default function Mading({ allData = [], setPageFunc, setCardData }) {
    const sortedCards = useMemo(() => {
        const descCards = [...allData].sort((a, b) => b.vote - a.vote);
        const result = [];
        descCards.forEach((card, index) => {
            if (index % 2 === 0) {
                result.push(card);
            } else {
                result.unshift(card);
            }
        });
        return result;
    }, [allData]);

    return (
        <div id="mading-container" style={{ backgroundImage: `linear-gradient(to right, #cccccc 1px, transparent 1px), linear-gradient(to bottom, #cccccc 1px, transparent 1px)`, backgroundSize: "40px 40px" }} className="page-container w-[200svw] h-[200svh] lg:w-[125svw] lg:h-[275svh] bg-light flex flex-col justify-center items-center">
            <div className="flex flex-wrap justify-center items-start gap-4 lg:gap-8 text-xs md:text-lg">
                {sortedCards.slice(0, 10).map((card) => (
                    <Card key={card.id} card={card} setPageFunc={setPageFunc} setCardData={setCardData} />
                ))}
            </div>
        </div>
    );
};