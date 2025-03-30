type SearchBarProps = {
  searchValue: string
  placeholderText: string
  handleSearch: (value: string) => void
}

export const SearchBar = ({
  handleSearch,
  placeholderText,
  searchValue,
}: SearchBarProps) => {
  return (
    <input
      onChange={(e) => handleSearch(e.target.value)}
      placeholder={placeholderText}
      value={searchValue}
      data-default=""
      className={`blog-search roboto-mono normal ba br3 pa2`}
    />
  )
}
