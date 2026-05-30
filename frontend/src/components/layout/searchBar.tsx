import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (keyword: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder }) => {
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    onSearch(keyword.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="uts-search flex items-center gap-2">
      <input
        type="text"
        className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder={placeholder || "Tìm kiếm sản phẩm, danh mục hoặc thương hiệu..."}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white rounded-xl px-4 py-2 hover:bg-blue-600 transition"
      >
        <i className="bi bi-search"></i>
      </button>
    </div>
  );
};

export default SearchBar;
