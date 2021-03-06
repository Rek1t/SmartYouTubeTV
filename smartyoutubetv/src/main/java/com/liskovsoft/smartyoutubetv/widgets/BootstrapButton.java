package com.liskovsoft.smartyoutubetv.widgets;

import android.content.Context;
import android.content.res.TypedArray;
import android.graphics.Color;
import android.graphics.ColorMatrix;
import android.graphics.ColorMatrixColorFilter;
import android.graphics.drawable.Drawable;
import android.util.AttributeSet;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import com.liskovsoft.smartyoutubetv.R;

public class BootstrapButton extends LinearLayout {
    private Drawable mMainIcon;
    private String mTitleText;
    private LinearLayout wrapper;
    private LinearLayout content;
    private ImageView image;
    private TextView text;
    private final int PADDING = Utils.convertDpToPixel(15, getContext());
    private float mNormalTextSize;
    private float mZoomedTextSize;

    public BootstrapButton(Context context) {
        super(context);
        init();
    }

    public BootstrapButton(Context context, AttributeSet attrs) {
        super(context, attrs);

        TypedArray a = context.getTheme().obtainStyledAttributes(
                attrs,
                R.styleable.BootstrapButton,
                0, 0);

        try {
            mMainIcon = a.getDrawable(R.styleable.BootstrapButton_mainIcon);
            mTitleText = a.getString(R.styleable.BootstrapButton_titleText);
        } finally {
            a.recycle();
        }
        
        init();
    }

    public BootstrapButton(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    public BootstrapButton(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
        init();
    }

    private void init() {
        inflate();
        applyAttributes();
        transferClicks();
        setOnFocus();
        calculateTextSize();
        setDefaultState();
    }

    private void calculateTextSize() {
        mNormalTextSize = Utils.convertPixelsToDp(text.getTextSize(), this.getContext());
        mZoomedTextSize = mNormalTextSize * 1.3f;
    }

    private void setDefaultState() {
        makeUnfocused();
    }

    private void applyAttributes() {
        if (mMainIcon != null) {
            image.setImageDrawable(mMainIcon);
        }
        if (mTitleText != null) {
            text.setText(mTitleText);
        }
    }

    private void setOnFocus() {
        wrapper.setOnFocusChangeListener(new OnFocusChangeListener() {
            @Override
            public void onFocusChange(View v, boolean hasFocus) {
                if (hasFocus) {
                    makeFocused();
                } else {
                    makeUnfocused();
                }
            }
        });
    }

    private void makeUnfocused() {
        //text.setTextAppearance(BootstrapButton.this.getContext(), R.style.BootstrapButtonTextUnfocused);
        text.setTextColor(Color.DKGRAY);
        text.setTextSize(mNormalTextSize);
        int semitransparentBlack = Color.argb(70, 0, 0, 0);
        content.setBackgroundColor(semitransparentBlack);
        wrapper.setPadding(PADDING, PADDING, PADDING, PADDING);
        setImageColor();
    }

    private void makeFocused() {
        //text.setTextAppearance(BootstrapButton.this.getContext(), R.style.BootstrapButtonTextFocused);
        text.setTextColor(Color.BLACK);
        text.setTextSize(mZoomedTextSize);
        content.setBackgroundColor(Color.WHITE);
        wrapper.setPadding(0, 0, 0, 0);
        resetImageColor();
    }

    private void resetImageColor() {
        image.setColorFilter(null); // reset Tint
    }

    private void setImageColor() {
        ColorMatrix matrix = new ColorMatrix();
        matrix.setSaturation(0);
        ColorMatrixColorFilter filter = new ColorMatrixColorFilter(matrix);
        image.setColorFilter(filter); // greyscale
    }

    private void inflate() {
        inflate(getContext(), R.layout.bootstrap_button, this);
        wrapper = (LinearLayout) findViewById(R.id.bootstrap_button_wrapper);
        content = (LinearLayout) findViewById(R.id.bootstrap_button_content);
        image = (ImageView) findViewById(R.id.bootstrap_button_image);
        text = (TextView) findViewById(R.id.bootstrap_button_text);
    }

    private void transferClicks() {
        wrapper.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                BootstrapButton.this.performClick();
            }
        });
    }

}
