export default function ThinkingDots({clazzName} : Readonly <{clazzName?: string}>) {
    return (
        <div className={`thinking-loader ${clazzName}`}></div>
    );
}