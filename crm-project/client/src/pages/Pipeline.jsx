import { useEffect, useState } from "react";
import api from "../api/axios";

const STAGES = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

const Pipeline = () => {
  const [board, setBoard] = useState({});
  const [pipelineValue, setPipelineValue] = useState(0);
  const [draggedId, setDraggedId] = useState(null);

  const fetchPipeline = async () => {
    const res = await api.get("/opportunities/pipeline");
    setBoard(res.data.board);
    setPipelineValue(res.data.openPipelineValue);
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  const handleDrop = async (stage) => {
    if (!draggedId) return;
    await api.patch(`/opportunities/${draggedId}/stage`, { stage });
    setDraggedId(null);
    fetchPipeline();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Sales pipeline</h1>
        <p className="text-sm text-gray-500">
          Open pipeline value: <span className="font-semibold text-gray-800">${pipelineValue.toLocaleString()}</span>
        </p>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div
            key={stage}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(stage)}
            className="bg-gray-100 rounded-lg p-3 w-64 flex-shrink-0"
          >
            <p className="text-sm font-semibold mb-3 text-gray-600">
              {stage} <span className="text-gray-400">({board[stage]?.length || 0})</span>
            </p>
            <div className="space-y-2 min-h-[80px]">
              {(board[stage] || []).map((opp) => (
                <div
                  key={opp._id}
                  draggable
                  onDragStart={() => setDraggedId(opp._id)}
                  className="bg-white border rounded-md p-3 shadow-sm cursor-move"
                >
                  <p className="text-sm font-medium">{opp.title}</p>
                  <p className="text-xs text-gray-500">{opp.customer?.companyName}</p>
                  <p className="text-xs text-gray-500">${opp.value.toLocaleString()}</p>
                  {opp.expectedCloseDate && (
                    <p className="text-xs text-gray-400">
                      Close: {new Date(opp.expectedCloseDate).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">{opp.assignedTo?.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pipeline;
