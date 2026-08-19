package com.example.kuiklydsl

import com.tencent.kuikly.core.annotations.Page
import com.tencent.kuikly.core.base.*
import com.tencent.kuikly.core.views.*
import com.example.kuiklydsl.base.BasePager

@Page("router", supportInLocal = true)
internal class RouterPage : BasePager() {

    override fun body(): ViewBuilder {
        val ctx = this
        return {
            attr {
                backgroundColor(Color.WHITE)
                allCenter()
            }
            Text {
                attr {
                    text("hello kuikly")
                    fontSize(20f)
                    color(Color.GREEN)
                }
            }
        }
    }
}
