
"use client";

import { useState, useMemo, useEffect } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Search, Globe, Mail, Phone, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sampleProductCompanies } from "@/lib/sample-data";
import type { ProductCompany } from "@/types";

export default function CompanyDatabasePage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 12;

  const companies = sampleProductCompanies || [];
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLocation, selectedDomain]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(companies.map(c => c.location));
    return ["all", ...Array.from(locations).sort()];
  }, [companies]);
  
  const uniqueDomains = useMemo(() => {
    const domains = new Set(companies.map(c => c.domain));
    return ["all", ...Array.from(domains).sort()];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return companies.filter(company => {
      const matchesSearch = lowercasedSearchTerm === "" ||
        company.name.toLowerCase().includes(lowercasedSearchTerm);
      
      const matchesLocation = selectedLocation === "all" || company.location === selectedLocation;
      
      const matchesDomain = selectedDomain === "all" || company.domain === selectedDomain;

      return matchesSearch && matchesLocation && matchesDomain;
    });
  }, [searchTerm, selectedLocation, selectedDomain, companies]);

  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * companiesPerPage;
    return filteredCompanies.slice(startIndex, startIndex + companiesPerPage);
  }, [filteredCompanies, currentPage, companiesPerPage]);
  
  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <Building2 className="h-8 w-8" /> Product Company Database
      </h1>
      <CardDescription>
        Explore and filter our database of product-based companies.
      </CardDescription>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Filter by domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {uniqueDomains.map(domain => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Filter by location" />
            </SelectTrigger>
            <SelectContent>
              {uniqueLocations.map(location => (
                <SelectItem key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {paginatedCompanies.length === 0 ? (
        <Card className="text-center py-12 shadow-md">
            <CardHeader>
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-2xl">No Companies Found</CardTitle>
                <CardDescription>
                  Try adjusting your search or filter criteria.
                </CardDescription>
            </CardHeader>
        </Card>
      ) : (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCompanies.map(company => (
            <Card key={company.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4">
                <Avatar className="w-16 h-16 rounded-md">
                  <AvatarImage src={company.logoUrl} alt={`${company.name} logo`} />
                  <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xl">
                    {company.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{company.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{company.location}</p>
                   <p className="text-xs text-primary font-medium mt-1 line-clamp-1">{company.domain}</p>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-sm">
                {company.hrName && <p className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /> <strong>HR:</strong> {company.hrName}</p>}
                {company.hrEmail && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> <a href={`mailto:${company.hrEmail}`} className="text-primary hover:underline">{company.hrEmail}</a></p>}
                {company.contactNumber && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {company.contactNumber}</p>}
              </CardContent>
              <CardFooter className="border-t pt-4 mt-auto">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" /> Visit Website
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {totalPages > 1 && (
            <div className="flex items-center justify-center pt-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <span className="mx-4 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                >
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        )}
        </>
      )}
    </div>
  );
}
