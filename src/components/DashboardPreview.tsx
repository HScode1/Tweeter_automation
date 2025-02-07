import { Search } from "lucide-react"

export function DashboardPreview() {
  const companies = [
    {
      name: "Pandora",
      website: "pandora.com",
      opportunity: "High",
      updated: "Aug 15th, 2024",
      assignedTo: "David Zhang"
    },
    {
      name: "Snowflake",
      website: "snowflake.com",
      opportunity: "Medium",
      updated: "Aug 8th, 2024",
      assignedTo: "Sophie Silverman"
    },
    {
      name: "AirTable",
      website: "airtable.com",
      opportunity: "Medium",
      updated: "Aug 8th, 2024",
      assignedTo: "Oscar Yuen"
    },
    {
      name: "Salesforce",
      website: "salesforce.com",
      opportunity: "Medium",
      updated: "Aug 8th, 2024",
      assignedTo: "Samuel McFarland"
    }
  ]

  return (
    <div className="bg-white rounded-2xl border shadow-xl">
      <div className="p-4">
        <div className="flex items-center space-x-2 bg-gray-50 rounded-md px-3 py-2 w-fit">
          <Search className="h-4 w-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Type account name to search..." 
            className="bg-transparent border-none outline-none text-sm placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-5 px-6 py-3 border-y bg-gray-50 text-sm text-gray-500">
          <div>Company</div>
          <div>Website</div>
          <div>Opportunity</div>
          <div>Updated at</div>
          <div>Assigned to</div>
        </div>

        {companies.map((company, index) => (
          <div 
            key={index}
            className="grid grid-cols-5 px-6 py-4 border-b last:border-b-0 text-sm hover:bg-gray-50"
          >
            <div className="font-medium">{company.name}</div>
            <div className="text-gray-600">{company.website}</div>
            <div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                company.opportunity === "High" 
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}>
                {company.opportunity}
              </span>
            </div>
            <div className="text-gray-600">{company.updated}</div>
            <div className="text-gray-600">{company.assignedTo}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
