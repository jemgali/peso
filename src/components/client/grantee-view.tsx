"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  FileText, 
  Printer, 
  Eye, 
  FileCheck, 
  Files, 
  Layout, 
  ExternalLink,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import BatchSelection from "./batch-selection"

interface DocumentItem {
  file: string
  label: string
  copies: number
  paperSize: string
  description: string
}

const DOCUMENTS: DocumentItem[] = [
  { 
    file: "dole-spes-checklist.pdf", 
    label: "DOLE SPES Checklist", 
    copies: 2, 
    paperSize: 'Long Bond (8.5" x 13")',
    description: "Checklist of requirements for SPES application"
  },
  { 
    file: "dole-spes-registration.pdf", 
    label: "DOLE SPES Registration", 
    copies: 1, 
    paperSize: 'Long Bond (8.5" x 13")',
    description: "SPES Registration Form (DOLE-V-SPES-Form 1)"
  },
  { 
    file: "dole-spes-application.pdf", 
    label: "DOLE SPES Application", 
    copies: 3, 
    paperSize: "A4 (8.27\" x 11.69\")",
    description: "SPES Application Form (DOLE-V-SPES-Form 2)"
  },
  { 
    file: "dole-spes-contract.pdf", 
    label: "DOLE SPES Employment Contract", 
    copies: 3, 
    paperSize: "A4 (8.27\" x 11.69\")",
    description: "Employment Contract between the employer and the SPES student"
  },
  { 
    file: "dole-spes-oath.pdf", 
    label: "DOLE SPES Oath", 
    copies: 2, 
    paperSize: "A4 (8.27\" x 11.69\")",
    description: "Oath of Undertaking for SPES beneficiaries"
  },
]

export default function GranteeView() {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(DOCUMENTS[0])

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Step 1: Batch Selection */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Badge className="size-6 flex items-center justify-center rounded-full p-0">1</Badge>
          <h2 className="text-xl font-bold tracking-tight">Step 1: Batch Selection</h2>
        </div>
        <BatchSelection />
      </section>

      {/* Step 2: Document Printing */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Badge className="size-6 flex items-center justify-center rounded-full p-0">2</Badge>
          <h2 className="text-xl font-bold tracking-tight">Step 2: Document Printing</h2>
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          {/* Left Column: List */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Required Documents
            </h3>
            <div className="flex flex-col gap-2">
              {DOCUMENTS.map((doc) => {
                const isSelected = selectedDoc?.file === doc.file;
                return (
                  <button
                    type="button"
                    key={doc.file}
                    onClick={() => setSelectedDoc(doc)}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left transition-all duration-200 group",
                      isSelected 
                        ? "ring-1 ring-primary bg-primary/5 border-primary/30 shadow-sm" 
                        : "hover:bg-muted/50 border-transparent hover:border-border"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-2.5 rounded-lg shrink-0 transition-colors",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        <FileText className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className={cn(
                            "text-sm font-bold leading-tight",
                            isSelected ? "text-primary" : "text-foreground"
                          )}>
                            {doc.label}
                          </h4>
                          <Badge variant={isSelected ? "default" : "outline"} className="text-[10px] font-bold py-0 h-4">
                            {doc.copies} {doc.copies > 1 ? "Copies" : "Copy"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                          {doc.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70">
                            <Layout className="size-3" />
                            <span>{doc.paperSize}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Printing Tips */}
            <div className="mt-8 p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
              <div className="flex gap-3">
                <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                  <Files className="size-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-300">
                    Printing Instructions
                  </p>
                  <ul className="text-[11px] text-blue-800/80 dark:text-blue-400/80 mt-2 space-y-1.5 list-disc pl-3">
                    <li>Use <strong>Long Bond</strong> or <strong>A4</strong> as indicated.</li>
                    <li>Set printer to <strong>"Actual Size"</strong> (100% Scale).</li>
                    <li>Verify copy counts before submission.</li>
                    <li>All documents must be signed.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview */}
          <Card className="h-fit p-5 xl:sticky xl:top-6 border-primary/10 shadow-lg bg-background/50 backdrop-blur-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Document Preview</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedDoc ? selectedDoc.label : "Select a document to preview"}
                </p>
              </div>
              {selectedDoc && (
                <Badge variant="secondary" className="font-bold text-[10px]">
                  {selectedDoc.file}
                </Badge>
              )}
            </div>

            {selectedDoc ? (
              <div className="space-y-5">
                <div className="aspect-[1/1.414] w-full rounded-xl border border-primary/10 bg-muted/30 overflow-hidden relative group shadow-inner">
                  {/* Adding #toolbar=0 to the PDF URL to keep the preview clean */}
                  <iframe 
                    src={`/form-layouts/${selectedDoc.file}#toolbar=0&navpanes=0`} 
                    className="w-full h-full border-none"
                    title={selectedDoc.label}
                  />
                  <div className="absolute inset-0 bg-background/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none backdrop-blur-[1px]">
                    <div className="flex items-center gap-2 bg-background p-2.5 rounded-lg shadow-xl border border-primary/20 scale-90 group-hover:scale-100 transition-transform">
                      <Eye className="size-4 text-primary" />
                      <span className="text-xs font-bold">Document Preview</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="size-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-primary">Requirement Summary</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Print <strong>{selectedDoc.copies} {selectedDoc.copies > 1 ? "copies" : "copy"}</strong> on <strong>{selectedDoc.paperSize}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button size="lg" className="h-12 font-bold shadow-md shadow-primary/20 w-full" asChild>
                    <Link href={`/form-layouts/${selectedDoc.file}`} target="_blank">
                      <Printer className="size-4 mr-2" />
                      Generate & Print Document
                    </Link>
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="lg" className="h-11 font-bold" asChild>
                      <Link href={`/form-layouts/${selectedDoc.file}`} download={selectedDoc.file}>
                        <FileCheck className="size-4 mr-2" />
                        Download
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="h-11 font-bold" asChild>
                      <Link href={`/form-layouts/${selectedDoc.file}`} target="_blank">
                        <ExternalLink className="size-4 mr-2" />
                        Full View
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[1/1.414] w-full rounded-xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/5">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Files className="size-8 opacity-20" />
                </div>
                <h4 className="text-sm font-bold mb-1">No Document Selected</h4>
                <p className="text-xs max-w-[200px] leading-relaxed">Select a document from the left list to see its preview and printing options.</p>
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  )
}
