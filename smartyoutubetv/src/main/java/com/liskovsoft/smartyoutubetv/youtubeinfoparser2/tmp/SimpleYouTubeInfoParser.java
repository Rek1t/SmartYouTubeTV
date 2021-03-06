package com.liskovsoft.smartyoutubetv.youtubeinfoparser2.tmp;

import android.net.Uri;
import com.liskovsoft.smartyoutubetv.youtubeinfoparser2.SimpleYouTubeMediaItem;
import com.liskovsoft.smartyoutubetv.youtubeinfoparser2.YouTubeMediaItem;

import java.io.InputStream;
import java.util.List;
import java.util.Scanner;

public class SimpleYouTubeInfoParser implements YouTubeInfoParser {
    private final String mContent;

    private class FindUriVisitor implements YouTubeInfoVisitor {
        private final YouTubeMediaItem mOriginItem;
        private YouTubeMediaItem mLastItem;

        FindUriVisitor(String iTag) {
            mOriginItem = new SimpleYouTubeMediaItem(iTag);
        }

        @Override
        public void visitMediaItem(YouTubeMediaItem mediaItem) {
            if (mediaItem.compareTo(mOriginItem) <= 0 && mediaItem.compareTo(mLastItem) > 0) {
                mLastItem = mediaItem;
            }
        }

        public Uri getUri() {
            if (mLastItem == null) {
                return Uri.parse("");
            }
            return Uri.parse(mLastItem.getUrl());
        }
    }

    public SimpleYouTubeInfoParser(InputStream stream) {
        mContent = readStream(stream);
    }

    private String readStream(InputStream stream) {
        Scanner s = new Scanner(stream).useDelimiter("\\A");
        String result = s.hasNext() ? s.next() : "";
        return result;
    }

    public SimpleYouTubeInfoParser(String content) {
        mContent = content;
    }

    @Override
    public List<String> getAllVideoLinks() {
        return null;
    }

    @Override
    public Uri getUrlByTag(String iTag) {
        SimpleYouTubeInfoVisitable visitable = new SimpleYouTubeInfoVisitable(mContent);
        FindUriVisitor visitor = new FindUriVisitor(iTag);
        visitable.accept(visitor);
        return visitor.getUri();
    }
}
