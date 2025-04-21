"use client";

const DeleteConfirmModal = ({
  showDeleteConfirm,
  setShowDeleteConfirm,
  handleDelete,
  selectedDataType,
}) => {
  if (!showDeleteConfirm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-xl sm:p-6">
        <h3 className="mb-2 text-sm font-medium sm:text-lg">
          Delete this {selectedDataType.slice(0, -1)}?
        </h3>
        <p className="mb-4 text-xs text-gray-500 sm:text-sm">
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowDeleteConfirm(null)}
            className="px-2.5 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-md sm:px-4 sm:py-2 sm:text-sm hover:bg-gray-50"
          >
            No
          </button>
          <button
            onClick={() => handleDelete(showDeleteConfirm)}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 bg-[#D32F2F] text-white rounded-md text-xs sm:text-sm font-medium hover:bg-opacity-90"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
