import React, { useState } from "react";
import DocumentEditor from "./DocumentEditor";

const SingleDocument = ({ templateData }) => {
  const [data, setData] = useState({
    title: templateData.name,
    content: templateData.content,
  });

  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-700 bg-[#18181b] text-neutral-100 flex flex-col gap-2 flex-1 w-full h-full py-12">
        <div className="min-h-[80vh]">
          <DocumentEditor data={data} templateId={templateData.id} />
        </div>
      </div>
    </div>
  );
};

export default SingleDocument;
