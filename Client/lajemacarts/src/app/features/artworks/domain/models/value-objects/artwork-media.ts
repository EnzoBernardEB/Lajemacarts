import {Result} from '../../../../../shared/core/result';
import {DomainErrors} from '../../../../../shared/domain/errors/domain-errors';

export interface ArtworkMediaProps {
  url: string;
  type: 'image' | 'video';
  title?: string;
}

export class ArtworkMedia {
  public readonly url: string;
  public readonly type: 'image' | 'video';
  public readonly title?: string;

  private constructor(props: ArtworkMediaProps) {
    this.url = props.url;
    this.type = props.type;
    this.title = props.title;
  }

  public static create(props: ArtworkMediaProps): Result<ArtworkMedia> {
    if (!props.url || props.url.trim().length === 0) {
      return Result.failure<ArtworkMedia>(DomainErrors.Artwork.MediaUrlInvalid);
    }
    return Result.success<ArtworkMedia>(new ArtworkMedia(props));
  }

  public static hydrate(props: ArtworkMediaProps): ArtworkMedia {
    return new ArtworkMedia(props);
  }
}
