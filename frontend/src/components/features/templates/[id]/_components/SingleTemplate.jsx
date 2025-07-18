"use client";
import React, { useState } from "react";
import TemplateEditor from "./TemplateEditor";

const SingleTemplate = ({ templateData }) => {
	const [data, setData] = useState({
		title: templateData.name,
		content: templateData.content,
	});

	return (
		<div className='flex flex-1'>
			<div className='p-2 md:p-10 rounded-tl-2xl border border-neutral-200 bg-white flex flex-col gap-2 flex-1 w-full h-full py-12'>				
				<div className='min-h-[80vh]'>
					<TemplateEditor
						data={data}
						templateId={templateData.id}
					/>
				</div>
			</div>
		</div>
	);
};

export default SingleTemplate;
