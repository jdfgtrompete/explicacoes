
import { useState } from 'react';
import { motion } from 'framer-motion';

const Index = () => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [cellValues, setCellValues] = useState<{ [key: string]: string }>({});

  const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const ROWS = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId);
  };

  const handleCellChange = (cellId: string, value: string) => {
    setCellValues((prev) => ({
      ...prev,
      [cellId]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-light text-gray-800 text-center"
          >
            Excel Magic Mate
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-center mt-2"
          >
            A beautiful spreadsheet experience
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-12 h-12 bg-gray-50 border border-gray-200"></th>
                  {COLUMNS.map((column) => (
                    <th
                      key={column}
                      className="w-32 h-12 bg-gray-50 border border-gray-200 text-sm font-medium text-gray-600"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row}>
                    <td className="w-12 h-12 bg-gray-50 border border-gray-200 text-sm font-medium text-gray-600 text-center">
                      {row}
                    </td>
                    {COLUMNS.map((column) => {
                      const cellId = `${column}${row}`;
                      return (
                        <td
                          key={cellId}
                          className={`border border-gray-200 p-0 transition-colors ${
                            selectedCell === cellId ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleCellClick(cellId)}
                        >
                          <input
                            type="text"
                            value={cellValues[cellId] || ''}
                            onChange={(e) => handleCellChange(cellId, e.target.value)}
                            className="w-full h-full px-2 py-2 focus:outline-none bg-transparent"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
