import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MediaUploadComponent} from './media-upload.component';
import {Renderer2} from '@angular/core';
import {By} from '@angular/platform-browser';

describe('MediaUploadComponent', () => {
  let component: MediaUploadComponent;
  let fixture: ComponentFixture<MediaUploadComponent>;
  let selectionChangeEmitSpy: jest.SpyInstance;

  const mockCreateObjectURL = jest.fn();
  const mockRevokeObjectURL = jest.fn();

  beforeAll(() => {
    Object.defineProperty(global, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
      writable: true,
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaUploadComponent],
      providers: [
        {provide: Renderer2, useValue: {listen: jest.fn()}},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaUploadComponent);
    component = fixture.componentInstance;

    selectionChangeEmitSpy = jest.spyOn(component.selectionChange, 'emit');

    // Clear mocks before each test to ensure isolation
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with no new files or previews', () => {
    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    expect(emptyState).toBeTruthy();
    expect(emptyState.nativeElement.textContent).toContain('Aucun média ajouté pour le moment.');
    expect(fixture.debugElement.queryAll(By.css('.preview-card')).length).toBe(0);
  });

  it('should display existing media if provided', () => {
    const existingMedia = [
      {url: 'url1', type: 'image', title: 'Image 1'},
      {url: 'url2', type: 'video', title: 'Video 1'},
    ];
    fixture.componentRef.setInput('existingMedia', existingMedia);
    fixture.detectChanges();

    const previewCards = fixture.debugElement.queryAll(By.css('.preview-card'));
    expect(previewCards.length).toBe(2);

    const img1 = previewCards[0].query(By.css('img'));
    expect(img1).toBeTruthy();
    expect(img1.nativeElement.src).toContain('url1');
    expect(img1.nativeElement.alt).toBe('Image 1');

    const video1 = previewCards[1].query(By.css('video'));
    expect(video1).toBeTruthy();
    expect(video1.query(By.css('source')).nativeElement.src).toContain('url2');
  });

  describe('File Selection', () => {
    it('should trigger file input click on area click', () => {
      const fileInput = fixture.debugElement.query(By.css('input[type="file"]')).nativeElement;
      const clickSpy = jest.spyOn(fileInput, 'click');
      component.onAreaClick();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should handle file selection and update previews', () => {
      const file = new File([''], 'test.png', {type: 'image/png'});
      const event = {target: {files: [file]}} as unknown as Event;
      mockCreateObjectURL.mockReturnValue('blob:test-url');

      component.onFileSelected(event);
      fixture.detectChanges();

      const previewCards = fixture.debugElement.queryAll(By.css('.preview-card'));
      expect(previewCards.length).toBe(1);
      const img = previewCards[0].query(By.css('img'));
      expect(img).toBeTruthy();
      expect(img.nativeElement.src).toContain('blob:test-url');
      expect(img.nativeElement.alt).toBe('test.png');
      expect(selectionChangeEmitSpy).toHaveBeenCalledWith([file]);
    });

    it('should filter out invalid file types', () => {
      const validFile = new File([''], 'valid.png', {type: 'image/png'});
      const invalidFile = new File([''], 'invalid.txt', {type: 'text/plain'});
      const event = {target: {files: [validFile, invalidFile]}} as unknown as Event;
      mockCreateObjectURL.mockReturnValue('blob:test-url');

      component.onFileSelected(event);
      fixture.detectChanges();

      const previewCards = fixture.debugElement.queryAll(By.css('.preview-card'));
      expect(previewCards.length).toBe(1);
      const img = previewCards[0].query(By.css('img'));
      expect(img).toBeTruthy();
      expect(img.nativeElement.src).toContain('blob:test-url');
      expect(img.nativeElement.alt).toBe('valid.png');
      expect(selectionChangeEmitSpy).toHaveBeenCalledWith([validFile]);
    });
  });

  describe('Drag and Drop', () => {
    let preventDefaultSpy: jest.SpyInstance;
    let stopPropagationSpy: jest.SpyInstance;

    beforeEach(() => {
      preventDefaultSpy = jest.fn();
      stopPropagationSpy = jest.fn();
    });

    it('should set isDragging to true on drag over', () => {
      const event = {preventDefault: preventDefaultSpy, stopPropagation: stopPropagationSpy} as unknown as DragEvent;
      component.onDragOver(event);
      fixture.detectChanges();
      const dropZone = fixture.debugElement.query(By.css('.drop-zone'));
      expect(dropZone.nativeElement.classList.contains('dragging')).toBe(true);
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should set isDragging to false on drag leave', () => {
      const dragOverEvent = {preventDefault: jest.fn(), stopPropagation: jest.fn()} as unknown as DragEvent;
      component.onDragOver(dragOverEvent);
      fixture.detectChanges();
      let dropZone = fixture.debugElement.query(By.css('.drop-zone'));
      expect(dropZone.nativeElement.classList.contains('dragging')).toBe(true);

      const dragLeaveEvent = {
        preventDefault: preventDefaultSpy,
        stopPropagation: stopPropagationSpy
      } as unknown as DragEvent;
      component.onDragLeave(dragLeaveEvent);
      fixture.detectChanges();
      dropZone = fixture.debugElement.query(By.css('.drop-zone'));
      expect(dropZone.nativeElement.classList.contains('dragging')).toBe(false);
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });

    it('should handle dropped files and update previews', () => {
      const file = new File([''], 'drop.png', {type: 'image/png'});
      const dataTransfer = {files: [file]} as unknown as DataTransfer;
      const event = {
        preventDefault: preventDefaultSpy,
        stopPropagation: stopPropagationSpy,
        dataTransfer
      } as unknown as DragEvent;
      mockCreateObjectURL.mockReturnValue('blob:drop-url');

      component.onDrop(event);
      fixture.detectChanges();

      const dropZone = fixture.debugElement.query(By.css('.drop-zone'));
      expect(dropZone.nativeElement.classList.contains('dragging')).toBe(false);

      const previewCards = fixture.debugElement.queryAll(By.css('.preview-card'));
      expect(previewCards.length).toBe(1);
      const img = previewCards[0].query(By.css('img'));
      expect(img).toBeTruthy();
      expect(img.nativeElement.src).toContain('blob:drop-url');
      expect(img.nativeElement.alt).toBe('drop.png');
      expect(selectionChangeEmitSpy).toHaveBeenCalledWith([file]);
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
    });
  });

  describe('File Removal', () => {
    let file1: File;
    let file2: File;
    let preview1: any;
    let preview2: any;

    beforeEach(() => {
      file1 = new File([''], 'file1.png', {type: 'image/png'});
      file2 = new File([''], 'file2.mp4', {type: 'video/mp4'});
      mockCreateObjectURL.mockImplementation((f: File) => `blob:${f.name}`);

      component['newFiles'].set([file1, file2]);
      preview1 = {name: 'file1.png', url: 'blob:file1.png', type: 'image', file: file1};
      preview2 = {name: 'file2.mp4', url: 'blob:file2.mp4', type: 'video', file: file2};
      component['newPreviews'].set([preview1, preview2]);
      fixture.detectChanges();
    });

    it('should remove a selected file and its preview', () => {
      component.removeNewFile(preview1);
      fixture.detectChanges();

      const previewCards = fixture.debugElement.queryAll(By.css('.preview-card'));
      expect(previewCards.length).toBe(1);
      const video = previewCards[0].query(By.css('video'));
      expect(video).toBeTruthy();
      expect(video.query(By.css('source')).nativeElement.src).toContain('blob:file2.mp4');
      expect(selectionChangeEmitSpy).toHaveBeenCalledWith([file2]);
    });

    it('should update newFiles and newPreviews after removal', () => {
      component.removeNewFile(preview2);
      fixture.detectChanges();

      const previewCards = fixture.debugElement.queryAll(By.css('.preview-card'));
      expect(previewCards.length).toBe(1);
      const img = previewCards[0].query(By.css('img'));
      expect(img).toBeTruthy();
      expect(img.nativeElement.src).toContain('blob:file1.png');
      expect(selectionChangeEmitSpy).toHaveBeenCalledWith([file1]);
    });
  });

  describe('Reset', () => {
    beforeEach(() => {
      const file = new File([''], 'test.png', {type: 'image/png'});
      mockCreateObjectURL.mockReturnValue('blob:test-url');
      component['newFiles'].set([file]);
      component['newPreviews'].set([{name: 'test.png', url: 'blob:test-url', type: 'image', file: file}]);
      fixture.detectChanges();
    });

    it('should clear all new files and previews', () => {
      component.reset();
      fixture.detectChanges();
      const emptyState = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyState).toBeTruthy();
      expect(fixture.debugElement.queryAll(By.css('.preview-card')).length).toBe(0);
      expect(selectionChangeEmitSpy).toHaveBeenCalledWith([]);
    });
  });

  describe('Lifecycle', () => {
    it('should revoke object URLs on destroy', () => {
      const file = new File([''], 'test.png', {type: 'image/png'});
      mockCreateObjectURL.mockReturnValue('blob:test-url');
      const revokeSpy = jest.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {
      });

      component['newFiles'].set([file]);
      component['newPreviews'].set([{name: 'test.png', url: 'blob:test-url', type: 'image', file: file}]);
      fixture.detectChanges();

      fixture.destroy();
      expect(revokeSpy).toHaveBeenCalledWith('blob:test-url');
    });
  });
});
