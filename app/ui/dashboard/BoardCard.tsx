import { Board } from '../../../models';

export function BoardCard({ board }: { board: Board }) {
    return (
        <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
            <div className="flex p-4">
                <h3 className="ml-2 text-sm font-medium">{board.name}</h3>
            </div>

            <p className="truncate rounded-xl bg-white px-4 py-8 text-center text-2xl">
                {board.layers.map((layer) => (
                    <div key={layer.id}>[{layer.index}]: {layer.name}</div>
                ))}
            </p>
        </div>
    );
}
