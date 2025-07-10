
"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@/hooks/use-i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Search, Globe, Mail, Phone, Link as LinkIcon, Briefcase } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sampleProductCompanies } from "@/lib/sample-data";
import type { ProductCompany } from "@/types";
import Link from "next/link";

export default function CompanyDatabasePage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const uniqueLocations = useMemo(() => {
    const locations = new Set(sampleProductCompanies.map(c => c.location));
    return ["all", ...Array.from(locations).sort()];
  }, []);

  const filteredCompanies = useMemo(() => {
    return sampleProductCompanies.filter(company => {
      const matchesSearch = searchTerm === "" ||
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.domain.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = selectedLocation === "all" || company.location === selectedLocation;

      return matchesSearch && matchesLocation;
    });
  }, [searchTerm, selectedLocation]);

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
              placeholder="Search by company name or domain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
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

      {filteredCompanies.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
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
      )}
    </div>
  );
}
