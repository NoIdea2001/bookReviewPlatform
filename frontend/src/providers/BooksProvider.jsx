import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  createBook as createBookRequest,
  deleteBook as deleteBookRequest,
  getBookById as getBookByIdRequest,
  updateBook as updateBookRequest,
} from "../services/book.service.js";

export const BooksContext = createContext({
  isMutating: false,
  lastMutationAt: null,
  createBook: async () => {},
  updateBook: async () => {},
  deleteBook: async () => {},
  getBookById: async () => {},
});

export const BooksProvider = ({ children }) => {
  const [isMutating, setIsMutating] = useState(false);
  const [lastMutationAt, setLastMutationAt] = useState(null);

  const executeMutation = useCallback(async (operation) => {
    setIsMutating(true);
    try {
      const result = await operation();
      setLastMutationAt(Date.now());
      return result;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const handleCreateBook = useCallback(
    (payload) => executeMutation(() => createBookRequest(payload)),
    [executeMutation]
  );

  const handleUpdateBook = useCallback(
    (bookId, payload) =>
      executeMutation(() => updateBookRequest(bookId, payload)),
    [executeMutation]
  );

  const handleDeleteBook = useCallback(
    (bookId) => executeMutation(() => deleteBookRequest(bookId)),
    [executeMutation]
  );

  const value = useMemo(
    () => ({
      isMutating,
      lastMutationAt,
      createBook: handleCreateBook,
      updateBook: handleUpdateBook,
      deleteBook: handleDeleteBook,
      getBookById: getBookByIdRequest,
    }),
    [
      handleCreateBook,
      handleUpdateBook,
      handleDeleteBook,
      isMutating,
      lastMutationAt,
    ]
  );

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
};

BooksProvider.propTypes = {
  children: PropTypes.node,
};

export const useBooks = () => useContext(BooksContext);
