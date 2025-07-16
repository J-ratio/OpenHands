const FileDetails = ({ file }) => {
	return (
		<div className='text-sm text-muted-foreground flex items-center justify-between'>
			<p>File: {file.name}</p>
			<p>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
		</div>
	);
};

export default FileDetails;
