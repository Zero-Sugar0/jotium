# Implementation Plan

Add copy/paste and drag-and-drop image functionality to the multimodal input component while maintaining all existing features and increasing file size limit to 10MB.

This implementation enhances the existing file upload system by adding intuitive copy/paste and drag-and-drop capabilities. The current system uses a file picker button and supports various file types including images, PDFs, and audio files. The new functionality will integrate seamlessly with the existing upload pipeline, using the same validation, error handling, and visual feedback patterns.

[Types]
Extend the existing file handling system with new event handlers and state management for copy/paste and drag-and-drop operations.

```typescript
interface DragState {
  isDragging: boolean;
  dragCounter: number;
}

interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

type FileUploadMethod = 'picker' | 'paste' | 'drag-drop';
```

[Files]
Modify the existing multimodal input component and file upload API to support enhanced file handling capabilities.

- **components/custom/multimodal-input.tsx**: Add copy/paste and drag-drop event handlers, visual feedback states, and integrate with existing upload pipeline
- **app/(chat)/api/files/upload/route.ts**: Update file size validation from 5MB to 10MB
- **components/custom/preview-attachment.tsx**: No changes needed (existing component handles all attachment types)

[Functions]
Add new event handlers and enhance existing upload functionality to support multiple input methods.

**New Functions:**
- `handlePaste(event: ClipboardEvent)`: Process pasted images from clipboard
- `handleDragOver(event: DragEvent)`: Manage drag-over visual feedback
- `handleDragEnter(event: DragEvent)`: Track drag enter events and update visual state
- `handleDragLeave(event: DragEvent)`: Track drag leave events and manage drop zone state
- `handleDrop(event: DragEvent)`: Process dropped files and initiate upload
- `validateFiles(files: File[]): FileValidationResult`: Validate file types and sizes before upload
- `processFiles(files: File[], method: FileUploadMethod)`: Centralized file processing for all upload methods

**Modified Functions:**
- `handleFileChange()`: Enhanced to work with new file processing pipeline
- `uploadFile()`: Updated to handle 10MB file size limit
- `useEffect()`: Add event listeners for paste and drag events

[Classes]
No new classes required. The existing component architecture will be extended with new event handlers and state management.

[Dependencies]
No new dependencies required. All functionality uses standard browser APIs:
- Clipboard API for copy/paste
- Drag and Drop API for drag-and-drop
- Existing `@vercel/blob` for file storage
- Existing `framer-motion` for visual feedback animations

[Testing]
Test the new functionality across different browsers and scenarios to ensure reliable file handling.

- **Manual Testing**: Test copy/paste with screenshots, image files, and mixed content
- **Drag-and-Drop Testing**: Test dragging single and multiple files from file explorer
- **Visual Feedback Testing**: Verify drag-over states and error notifications
- **File Validation Testing**: Confirm 10MB limit and file type restrictions work correctly
- **Integration Testing**: Ensure new methods work with existing file picker and audio recording

[Implementation Order]
Execute changes in sequence to maintain system stability and enable incremental testing.

1. **Update file size limit**: Modify the API endpoint to accept 10MB files
2. **Add drag state management**: Implement useState for drag feedback and counters
3. **Add paste event handler**: Implement clipboard processing with image detection
4. **Add drag-and-drop handlers**: Implement drag enter/leave/over/drop event handlers
5. **Add visual feedback**: Implement drag-over styling and animations
6. **Integrate with existing upload pipeline**: Connect new handlers to current uploadFile function
7. **Add file validation**: Implement centralized validation for all upload methods
8. **Test and refine**: Verify all functionality works together seamlessly
