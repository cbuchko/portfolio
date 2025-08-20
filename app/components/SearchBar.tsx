type SearchBarProps = {
  searchValue: string
  placeholderText: string
  handleSearch: (value: string) => void
}

export const SearchBar = ({ handleSearch, placeholderText, searchValue }: SearchBarProps) => {
  return (
    <input
      onChange={(e) => handleSearch(e.target.value)}
      placeholder={placeholderText}
      value={searchValue}
      data-default=""
      className={'border rounded-md px-2 py-1 w-[40%] md:w-[25%]'}
    />
  )
}
