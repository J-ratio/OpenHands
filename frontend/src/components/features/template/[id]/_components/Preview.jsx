import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../../ui/accordion";
import { cn, getAccordionDefaultValues } from "../../../../../utils/utils";
import SingleCodebase from "./SingleCodebase";
import { toast } from "sonner";
import { syncCodebase } from "../../../../../api/data-sources";
import SingleDocumentPreview from "./SingleDocumentPreview";
import { ScrollArea } from "../../../../ui/scroll-area";

const Preview = ({ dataSources, editor }) => {
  // Filter data sources into codebases and documents
  const [codebases, setCodebases] = useState(
    dataSources?.filter((source) => source.type === "GIT_REPOSITORY") || [],
  );
  const documents =
    dataSources?.filter((source) => source.type === "FILE") || [];

  const handleSync = async (codebase) => {
    const { success, data, error } = await syncCodebase(codebase.id);

    if (!success) {
      toast.error(error);
    } else {
      toast.success("Codebase synced successfully");
      setCodebases((prevCodebases) =>
        prevCodebases.map((cb) => {
          if (cb.id === codebase.id) {
            return data;
          }
          return cb;
        }),
      );
    }
  };

  return (
    <div className="col-span-2 h-full flex w-full">
      <div className="border-l border-gray-300 h-full mx-2"></div>
      <div className="w-full">
        <p className="font-medium mb-2">Sources</p>
        <Accordion
          type="multiple"
          defaultValue={getAccordionDefaultValues(codebases, documents)}
          className="w-full"
        >
          <AccordionItem value="codebases">
            <AccordionTrigger>Codebases</AccordionTrigger>
            <AccordionContent>
              <ScrollArea
                className={cn(
                  "w-full rounded-md",
                  codebases.length > 3 ? "h-60" : "h-32",
                )}
              >
                <div className="space-y-1 pb-0">
                  {codebases.map((codebase, _idx) => (
                    <SingleCodebase
                      key={"codebase-" + _idx}
                      codebase={codebase}
                      handleSync={handleSync}
                    />
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>

          {/* Document Accordion */}
          <AccordionItem value="documents">
            <AccordionTrigger>Files</AccordionTrigger>
            <AccordionContent>
              <ScrollArea
                className={cn(
                  "w-full rounded-md",
                  documents.length > 3 ? "h-60" : "h-32",
                )}
              >
                <div className="space-y-1 pb-0">
                  {documents.map((doc, _idx) => (
                    <SingleDocumentPreview
                      doc={doc}
                      key={"document-" + _idx}
                      handleSync={handleSync}
                    />
                  ))}
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Preview;
